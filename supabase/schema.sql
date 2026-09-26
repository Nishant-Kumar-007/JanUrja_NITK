-- ==============================================================================
-- JanUrja: Universal Energy Interface (UEI) P2P Solar Energy Trading Schema
-- Track 3: Reinvent Digital Public Infrastructure For Billions (NITK Surathkal)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('prosumer', 'consumer', 'both', 'regulator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE protocol_state AS ENUM (
        'DISCOVERED', 
        'QUOTED', 
        'AUTHORIZED', 
        'ALLOCATED', 
        'SETTLED', 
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('active', 'matched', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked directly to auth.users with strict RLS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('consumer', 'producer', 'prosumer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Optional JanUrja telemetry fields
    full_name TEXT,
    phone TEXT,
    upi_id TEXT DEFAULT 'user@okaxis',
    grid_zone TEXT DEFAULT 'S2-East', -- S1-North, S2-East, S3-South, S4-West
    address TEXT DEFAULT 'Surathkal Feeder 11kV',
    solar_capacity_kw NUMERIC(6,2) DEFAULT 0.00,
    wallet_balance NUMERIC(10,2) DEFAULT 1000.00
);

-- Trigger to automatically create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'consumer')
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        full_name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ENERGY NODES TABLE (Smart Meter & Telemetry Layer)
CREATE TABLE IF NOT EXISTS energy_nodes (
    id TEXT PRIMARY KEY, -- e.g., 'NODE-1042'
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    node_name TEXT NOT NULL,
    grid_zone TEXT NOT NULL, -- S1-North, S2-East, S3-South, S4-West, Central-Hub
    current_surplus_kwh NUMERIC(8,2) DEFAULT 0.00,
    current_deficit_kwh NUMERIC(8,2) DEFAULT 0.00,
    generation_rate_kw NUMERIC(6,2) DEFAULT 0.00,
    consumption_rate_kw NUMERIC(6,2) DEFAULT 0.00,
    renewable_percentage NUMERIC(5,2) DEFAULT 100.00,
    availability_window TEXT DEFAULT '09:00 - 17:30',
    distance_km NUMERIC(4,2) DEFAULT 0.8,
    smart_meter_id TEXT UNIQUE,
    status TEXT DEFAULT 'ONLINE',
    last_telemetry_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENERGY OFFERS TABLE (Peer-to-Peer Marketplace listings)
CREATE TABLE IF NOT EXISTS energy_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id TEXT REFERENCES energy_nodes(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    price_per_kwh NUMERIC(6,2) NOT NULL,
    quantity_kwh NUMERIC(8,2) NOT NULL,
    min_quantity_kwh NUMERIC(8,2) DEFAULT 0.50,
    status offer_status DEFAULT 'active',
    pricing_mode TEXT DEFAULT 'agentic', -- 'fixed' or 'agentic'
    natural_language_rule TEXT,
    valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '4 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE (Beckn Transactional Contracts)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT NOT NULL UNIQUE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    offer_id UUID REFERENCES energy_offers(id),
    node_id TEXT REFERENCES energy_nodes(id),
    quantity_kwh NUMERIC(8,2) NOT NULL,
    price_per_kwh NUMERIC(6,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    wheeling_charge NUMERIC(6,2) DEFAULT 0.50,
    discom_fee NUMERIC(6,2) DEFAULT 0.25,
    co2_avoided_kg NUMERIC(6,2) DEFAULT 0.00,
    protocol_state protocol_state DEFAULT 'DISCOVERED',
    bap_id TEXT DEFAULT 'janurja.buyer.nitk.uei',
    bpp_id TEXT DEFAULT 'janurja.seller.nitk.uei',
    upi_mandate_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

-- 7. PROTOCOL EVENTS (Beckn Audit Log & Realtime Stream)
CREATE TABLE IF NOT EXISTS protocol_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'search', 'on_search', 'select', 'on_select', 'init', 'on_init', 'confirm', 'on_confirm', 'status'
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    protocol_version TEXT DEFAULT 'UEI/Beckn-v1.1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSACTIONS TABLE (Instant Mock UPI Financial Settlement)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    amount NUMERIC(10,2) NOT NULL,
    upi_txn_ref TEXT NOT NULL UNIQUE,
    payer_vpa TEXT NOT NULL,
    payee_vpa TEXT NOT NULL,
    co2_avoided_kg NUMERIC(6,2) NOT NULL,
    status TEXT DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Strict Row Level Security on profiles based on auth.uid() = id
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public read access for marketplace discovery & transparent public grid auditing
CREATE POLICY "Allow public read on energy_nodes" ON energy_nodes FOR SELECT USING (true);
CREATE POLICY "Allow public read on energy_offers" ON energy_offers FOR SELECT USING (true);
CREATE POLICY "Allow public read on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read on protocol_events" ON protocol_events FOR SELECT USING (true);
CREATE POLICY "Allow public read on transactions" ON transactions FOR SELECT USING (true);

-- Permissive write policies for hackathon client simulation
CREATE POLICY "Allow all insert on energy_nodes" ON energy_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on energy_nodes" ON energy_nodes FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on energy_offers" ON energy_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on energy_offers" ON energy_offers FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow all insert on protocol_events" ON protocol_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert on transactions" ON transactions FOR INSERT WITH CHECK (true);

-- 10. REALTIME REPLICATION ENABLEMENT (Supabase Realtime)
BEGIN;
  -- Drop publication if exists or alter
  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE protocol_events;
  EXCEPTION WHEN OTHERS THEN null;
  END $$;
  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN OTHERS THEN null;
  END $$;
  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE energy_nodes;
  EXCEPTION WHEN OTHERS THEN null;
  END $$;
  DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE energy_offers;
  EXCEPTION WHEN OTHERS THEN null;
  END $$;
COMMIT;

-- 11. SEED DATA (NITK Surathkal / Coastal Microgrid Demo)
INSERT INTO profiles (id, full_name, email, phone, upi_id, role, grid_zone, address, solar_capacity_kw, wallet_balance)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'NITK Solar Research Park', 'solarlab@nitk.edu.in', '+91 824 2474000', 'nitksolar@icici', 'prosumer', 'S1-North', 'Dept of E&E Engineering, NITK Campus', 25.00, 15400.00),
  ('44444444-4444-4444-4444-444444444444', 'Priya Nayak', 'priya.ev@surathkal.in', '+91 98451 11223', 'priya@okaxis', 'consumer', 'S3-South', 'Green Villa, Srinivasnagar, Surathkal', 1.50, 920.00),
  ('55555555-5555-5555-5555-555555555555', 'MESCOM DISCOM Node', 'nodal@mescom.karnataka.gov.in', '+91 824 2450000', 'mescom.settlement@rbi', 'producer', 'Central-Hub', 'MESCOM Substation, Mangaluru Circle', 100.00, 98500.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO energy_nodes (id, owner_id, node_name, grid_zone, current_surplus_kwh, current_deficit_kwh, generation_rate_kw, consumption_rate_kw, renewable_percentage, availability_window, distance_km, smart_meter_id)
VALUES
  ('NODE-2010', '33333333-3333-3333-3333-333333333333', 'NITK Microgrid Hub', 'S1-North', 18.50, 0.00, 22.00, 3.50, 99.50, '07:30 - 18:00', 1.40, 'SM-KA-MNG-2010'),
  ('NODE-3045', '44444444-4444-4444-4444-444444444444', 'Srinivas Fast EV Point', 'S3-South', 0.00, 8.20, 0.80, 9.00, 91.00, '06:00 - 22:00', 2.10, 'SM-KA-MNG-3045'),
  ('NODE-4015', '55555555-5555-5555-5555-555555555555', 'Surathkal Substation Feeder #4', 'Central-Hub', 50.00, 0.00, 50.00, 15.00, 78.00, '24x7 Continuous', 0.00, 'SM-KA-MNG-SUB4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO energy_offers (id, node_id, seller_id, price_per_kwh, quantity_kwh, min_quantity_kwh, status, pricing_mode, natural_language_rule)
VALUES
  ('b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'NODE-2010', '33333333-3333-3333-3333-333333333333', 5.80, 15.00, 2.00, 'active', 'fixed', 'Educational campus institutional surplus fixed rate'),
  ('c3333333-cccc-cccc-cccc-cccccccccccc', 'NODE-4015', '55555555-5555-5555-5555-555555555555', 7.10, 35.00, 5.00, 'active', 'agentic', 'Off-peak hydro/solar grid buffer balancing')
ON CONFLICT (id) DO NOTHING;
