// ==============================================================================
// Initial Seed Data for JanUrja — Bengaluru BESCOM Microgrid (5-Zone P2P Grid)
// ==============================================================================

export const INITIAL_PROFILES = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Hebbal Solar Research Park',
    role: 'prosumer',
    email: 'solarpark@hebbalbengaluru.in',
    phone: '+91 80 4125 0000',
    upi_id: 'hebbalsolar@icici',
    grid_zone: 'S1-North',
    address: 'Manyata Tech Park Rooftop Array, Hebbal, North Bengaluru',
    solar_capacity_kw: 25.00,
    wallet_balance: 15400.00,
    avatar: '🏛️',
    node_id: 'NODE-2010',
    bio: 'Manyata Tech Park 25 kW rooftop bifacial solar array serving the Hebbal 11kV feeder zone with surplus P2P energy.'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Ananya Reddy',
    role: 'consumer',
    email: 'ananya.ev@koramangala.in',
    phone: '+91 99001 22334',
    upi_id: 'ananya@okhdfcbank',
    grid_zone: 'S3-South',
    address: '4th Block, Koramangala, South Bengaluru',
    solar_capacity_kw: 2.00,
    wallet_balance: 920.00,
    avatar: '👩‍💻',
    node_id: 'NODE-3045',
    bio: 'EV owner and tech professional in Koramangala looking for affordable solar energy for daily commute charging.'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'BESCOM State Utility (Regulator)',
    role: 'regulator',
    email: 'nodal@bescom.karnataka.gov.in',
    phone: '+91 80 2238 0000',
    upi_id: 'bescom.settlement@rbi',
    grid_zone: 'Central-Hub',
    address: 'BESCOM 110kV Substation, Shivajinagar, Central Bengaluru',
    solar_capacity_kw: 100.00,
    wallet_balance: 98500.00,
    avatar: '⚡',
    node_id: 'NODE-4015',
    bio: 'BESCOM — Official Karnataka State Distribution Company managing grid stability, feeder routing, and P2P wheeling charges.'
  }
];

export const INITIAL_NODES = [
  {
    id: 'NODE-2010',
    owner_id: '33333333-3333-3333-3333-333333333333',
    node_name: 'Hebbal 11kV Microgrid Hub',
    grid_zone: 'S1-North',
    current_generation_kwh: 32.50,
    current_consumption_kwh: 28.00,
    current_surplus_kwh: 4.50,
    current_deficit_kwh: 0.00,
    generation_rate_kw: 32.50,
    consumption_rate_kw: 28.00,
    renewable_percentage: 99.5,
    availability_window: '07:30 - 18:00',
    distance_km: 0.80,
    smart_meter_id: 'SM-KA-BLR-2010',
    status: 'ONLINE',
    device_type: 'Hybrid Solar Storage ESS + SCADA Telemetry',
    frequency_hz: 50.01,
    voltage_v: 232.0,
    co2_saved_all_time_kg: 1240.0
  },
  {
    id: 'NODE-3045',
    owner_id: '44444444-4444-4444-4444-444444444444',
    node_name: 'Koramangala EV Fast Charge Point',
    grid_zone: 'S3-South',
    current_surplus_kwh: 0.00,
    current_deficit_kwh: 8.20,
    generation_rate_kw: 0.80,
    consumption_rate_kw: 9.00,
    renewable_percentage: 91.0,
    availability_window: '06:00 - 22:00',
    distance_km: 1.50,
    smart_meter_id: 'SM-KA-BLR-3045',
    status: 'ONLINE',
    device_type: 'CCS2 11kW EV Charger Node',
    frequency_hz: 49.95,
    voltage_v: 227.6,
    co2_saved_all_time_kg: 312.4
  },
  {
    id: 'NODE-4015',
    owner_id: '55555555-5555-5555-5555-555555555555',
    node_name: 'BESCOM Central Substation Feeder #4',
    grid_zone: 'Central-Hub',
    current_surplus_kwh: 50.00,
    current_deficit_kwh: 0.00,
    generation_rate_kw: 50.00,
    consumption_rate_kw: 15.00,
    renewable_percentage: 78.0,
    availability_window: '24x7 Continuous',
    distance_km: 0.00,
    smart_meter_id: 'SM-KA-BLR-SUB4',
    status: 'ONLINE',
    device_type: '110kV/11kV Substation RTU & Wheeling Bus',
    frequency_hz: 50.00,
    voltage_v: 230.0,
    co2_saved_all_time_kg: 4850.0
  },
  {
    id: 'NODE-5021',
    owner_id: '33333333-3333-3333-3333-333333333333',
    node_name: 'Malleshwaram Solar Co-op Hub',
    grid_zone: 'S4-West',
    current_surplus_kwh: 14.40,
    current_deficit_kwh: 0.00,
    generation_rate_kw: 20.00,
    consumption_rate_kw: 5.60,
    renewable_percentage: 98.0,
    availability_window: '08:00 - 17:30',
    distance_km: 1.90,
    smart_meter_id: 'SM-KA-BLR-5021',
    status: 'ONLINE',
    device_type: 'Community Rooftop Solar Array + Net Metering',
    frequency_hz: 50.02,
    voltage_v: 231.0,
    co2_saved_all_time_kg: 820.0
  },
  {
    id: 'NODE-6032',
    owner_id: '44444444-4444-4444-4444-444444444444',
    node_name: 'Indiranagar Commercial Rooftop Node',
    grid_zone: 'S2-East',
    current_surplus_kwh: 12.80,
    current_deficit_kwh: 0.00,
    generation_rate_kw: 18.00,
    consumption_rate_kw: 5.20,
    renewable_percentage: 95.0,
    availability_window: '07:00 - 18:00',
    distance_km: 1.20,
    smart_meter_id: 'SM-KA-BLR-6032',
    status: 'ONLINE',
    device_type: 'Rooftop PV + Smart Inverter SCADA',
    frequency_hz: 49.98,
    voltage_v: 229.5,
    co2_saved_all_time_kg: 610.0
  }
];

export const INITIAL_OFFERS = [
  {
    id: 'offer-2010',
    node_id: 'NODE-2010',
    seller_id: '33333333-3333-3333-3333-333333333333',
    seller_name: 'Hebbal Solar Research Park',
    node_name: 'Hebbal 11kV Microgrid Hub',
    grid_zone: 'S1-North',
    price_per_kwh: 5.80,
    quantity_kwh: 15.00,
    min_quantity_kwh: 2.00,
    status: 'active',
    pricing_mode: 'fixed',
    natural_language_rule: 'Manyata Tech Park surplus flat-rate for North Bengaluru neighbourhood uplift.',
    renewable_percentage: 99.5,
    distance_km: 0.80,
    availability_window: '07:30 - 18:00',
    trust_score: 100.0,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'offer-6032',
    node_id: 'NODE-6032',
    seller_id: '44444444-4444-4444-4444-444444444444',
    seller_name: 'Indiranagar Commercial Rooftop Co-op',
    node_name: 'Indiranagar Commercial Rooftop Node',
    grid_zone: 'S2-East',
    price_per_kwh: 6.20,
    quantity_kwh: 22.50,
    min_quantity_kwh: 2.00,
    status: 'active',
    pricing_mode: 'agentic',
    natural_language_rule: 'Undercut BESCOM commercial tariff by 20%. Never sell below ₹5.80/kWh.',
    renewable_percentage: 95.0,
    distance_km: 1.20,
    availability_window: '07:00 - 18:00',
    trust_score: 96.5,
    created_at: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'offer-3088',
    node_id: 'NODE-3045',
    seller_id: '44444444-4444-4444-4444-444444444444',
    seller_name: 'Koramangala EV Reserve (V2G)',
    node_name: 'Koramangala EV Fast Charge Point',
    grid_zone: 'S3-South',
    price_per_kwh: 6.75,
    quantity_kwh: 4.00,
    min_quantity_kwh: 1.00,
    status: 'active',
    pricing_mode: 'agentic',
    natural_language_rule: 'Vehicle-to-Grid (V2G) discharge when South BLR demand surges above ₹6.50/unit.',
    renewable_percentage: 92.0,
    distance_km: 1.50,
    availability_window: '12:00 - 16:00',
    trust_score: 97.5,
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'offer-5021',
    node_id: 'NODE-5021',
    seller_id: '33333333-3333-3333-3333-333333333333',
    seller_name: 'Malleshwaram Solar Co-op',
    node_name: 'Malleshwaram Solar Co-op Hub',
    grid_zone: 'S4-West',
    price_per_kwh: 6.10,
    quantity_kwh: 14.00,
    min_quantity_kwh: 1.50,
    status: 'active',
    pricing_mode: 'fixed',
    natural_language_rule: 'Community solar surplus pooled at flat cooperative rate for West Bengaluru residents.',
    renewable_percentage: 98.0,
    distance_km: 1.90,
    availability_window: '08:00 - 17:30',
    trust_score: 99.0,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'offer-4015',
    node_id: 'NODE-4015',
    seller_id: '55555555-5555-5555-5555-555555555555',
    seller_name: 'BESCOM Grid Buffer (Central)',
    node_name: 'BESCOM Central Substation Feeder #4',
    grid_zone: 'Central-Hub',
    price_per_kwh: 7.10,
    quantity_kwh: 35.00,
    min_quantity_kwh: 5.00,
    status: 'active',
    pricing_mode: 'agentic',
    natural_language_rule: 'Regulated grid balancing reserve — price dynamically between BESCOM tariff and feed-in credit.',
    renewable_percentage: 82.0,
    distance_km: 0.00,
    availability_window: '24x7 Continuous',
    trust_score: 98.9,
    created_at: new Date(Date.now() - 10800000).toISOString()
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-8710',
    transaction_id: 'TXN-UEI-2026-8710',
    buyer_id: '44444444-4444-4444-4444-444444444444',
    buyer_name: 'Ananya Reddy (EV)',
    seller_id: '33333333-3333-3333-3333-333333333333',
    seller_name: 'Hebbal Solar Research Park',
    node_id: 'NODE-2010',
    quantity_kwh: 8.50,
    price_per_kwh: 5.80,
    total_amount: 49.30,
    wheeling_charge: 1.25,
    discom_fee: 0.60,
    co2_avoided_kg: 4.59,
    protocol_state: 'SETTLED',
    bap_id: 'janurja.buyer.ananya.uei',
    bpp_id: 'janurja.seller.hebbal.uei',
    upi_mandate_id: 'UPI-MAND-761239-OKHDFCBANK',
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
    settled_at: new Date(Date.now() - 129 * 60000).toISOString()
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'txn-990',
    order_id: 'ord-8710',
    buyer_name: 'Ananya Reddy',
    seller_name: 'Hebbal Solar Park',
    amount: 49.30,
    upi_txn_ref: 'UPI/20260926/781190245129',
    payer_vpa: 'ananya@okhdfcbank',
    payee_vpa: 'hebbalsolar@icici',
    co2_avoided_kg: 4.59,
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 129 * 60000).toISOString()
  }
];

export const INITIAL_PROTOCOL_EVENTS = [
  {
    id: 'evt-1',
    order_id: 'ord-8710',
    action: 'search',
    sender_id: 'BAP:janurja.buyer.ananya.uei',
    recipient_id: 'BG:gateway.uei.karnataka.gov.in',
    message_id: 'msg-9901-search',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(),
    payload: {
      intent: {
        item: { descriptor: { name: 'P2P Solar Electricity' }, energy_type: 'SOLAR_PHOTOVOLTAIC' },
        fulfillment: { stops: [{ location: { gps: '13.0120,77.5946', zone_code: 'S1-North' } }] },
        payment: { type: 'ON-ORDER-SETTLEMENT', collected_by: 'BAP' }
      }
    }
  },
  {
    id: 'evt-2',
    order_id: 'ord-8710',
    action: 'on_search',
    sender_id: 'BPP:janurja.seller.hebbal.uei',
    recipient_id: 'BAP:janurja.buyer.ananya.uei',
    message_id: 'msg-9902-onsearch',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 44.9 * 60000).toLocaleTimeString(),
    payload: {
      catalog: {
        bpp_descriptor: { name: 'Hebbal 11kV Microgrid Hub Node #2010' },
        providers: [{
          id: 'NODE-2010',
          items: [{ id: 'SOLAR-KWH-01', price: { currency: 'INR', value: '5.80' }, quantity: { available: 15.00 } }]
        }]
      }
    }
  },
  {
    id: 'evt-3',
    order_id: 'ord-8710',
    action: 'select',
    sender_id: 'BAP:janurja.buyer.ananya.uei',
    recipient_id: 'BPP:janurja.seller.hebbal.uei',
    message_id: 'msg-9903-select',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 44.7 * 60000).toLocaleTimeString(),
    payload: {
      order: {
        provider: { id: 'NODE-2010' },
        items: [{ id: 'SOLAR-KWH-01', quantity: { selected: { count: 8.5 } } }]
      }
    }
  },
  {
    id: 'evt-4',
    order_id: 'ord-8710',
    action: 'on_select',
    sender_id: 'BPP:janurja.seller.hebbal.uei',
    recipient_id: 'BAP:janurja.buyer.ananya.uei',
    message_id: 'msg-9904-onselect',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 44.5 * 60000).toLocaleTimeString(),
    payload: {
      order: {
        quote: {
          price: { currency: 'INR', value: '49.30' },
          breakup: [
            { title: 'Energy Rate (8.5 kWh @ ₹5.80)', price: { value: '49.30' } },
            { title: 'BESCOM Wheeling Fee (₹0.15/kWh)', price: { value: '1.25' } },
            { title: 'GST & Regulatory Cess (₹0.60)', price: { value: '0.60' } }
          ]
        }
      }
    }
  },
  {
    id: 'evt-5',
    order_id: 'ord-8710',
    action: 'confirm',
    sender_id: 'BAP:janurja.buyer.ananya.uei',
    recipient_id: 'BPP:janurja.seller.hebbal.uei',
    message_id: 'msg-9905-confirm',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 44.2 * 60000).toLocaleTimeString(),
    payload: {
      order: {
        payment: {
          status: 'PAID',
          type: 'UPI-INSTANT',
          params: { transaction_ref: 'UPI/20260926/781190245129', amount: '49.30' }
        }
      }
    }
  },
  {
    id: 'evt-6',
    order_id: 'ord-8710',
    action: 'on_confirm',
    sender_id: 'BPP:janurja.seller.hebbal.uei',
    recipient_id: 'BAP:janurja.buyer.ananya.uei',
    message_id: 'msg-9906-onconfirm',
    protocol_version: 'UEI/Beckn-v1.1.0',
    timestamp: new Date(Date.now() - 44.0 * 60000).toLocaleTimeString(),
    payload: {
      order: {
        id: 'ord-8710',
        state: 'SETTLED',
        fulfillment: {
          state: { descriptor: { code: 'ENERGY_TRANSFER_ACTIVE' } },
          smart_meter_handshake: 'ACK_SYNCHRONIZED',
          co2_avoided_kg: 4.59
        }
      }
    }
  }
];

export const GRID_ZONES = [
  {
    code: 'North-BLR',
    alias: 'S1-North',
    name: 'North Bengaluru (Hebbal, Yelahanka, Manyata)',
    shortName: 'North Bengaluru',
    direction: 'N',
    surplus_kwh: 18.5,
    deficit_kwh: 2.1,
    active_nodes: 42,
    avg_price: 5.80,
    status: 'SURPLUS_HIGH',
    congestion: 'Low (18%)'
  },
  {
    code: 'East-BLR',
    alias: 'S2-East',
    name: 'East Bengaluru (Indiranagar, Whitefield, Marathahalli)',
    shortName: 'East Bengaluru',
    direction: 'E',
    surplus_kwh: 12.8,
    deficit_kwh: 14.5,
    active_nodes: 68,
    avg_price: 6.20,
    status: 'BALANCED',
    congestion: 'Moderate (42%)'
  },
  {
    code: 'South-BLR',
    alias: 'S3-South',
    name: 'South Bengaluru (Koramangala, Jayanagar, HSR, JP Nagar)',
    shortName: 'South Bengaluru',
    direction: 'S',
    surplus_kwh: 4.5,
    deficit_kwh: 16.2,
    active_nodes: 54,
    avg_price: 6.75,
    status: 'DEFICIT_HIGH',
    congestion: 'High (68%)'
  },
  {
    code: 'West-BLR',
    alias: 'S4-West',
    name: 'West Bengaluru (Malleshwaram, Rajajinagar, Yeshwanthpur)',
    shortName: 'West Bengaluru',
    direction: 'W',
    surplus_kwh: 14.4,
    deficit_kwh: 6.8,
    active_nodes: 39,
    avg_price: 6.10,
    status: 'SURPLUS_MILD',
    congestion: 'Low (25%)'
  },
  {
    code: 'Central-BLR',
    alias: 'Central-Hub',
    name: 'Central Bengaluru (MG Road, Shivajinagar, BESCOM HQ)',
    shortName: 'Central Bengaluru',
    direction: 'C',
    surplus_kwh: 50.0,
    deficit_kwh: 15.0,
    active_nodes: 110,
    avg_price: 7.10,
    status: 'GRID_BUFFER',
    congestion: 'Nominal (34%)'
  }
];

export const DISCOM_HOURLY_DATA = [
  { time: '06:00', traditionalLoad: 42, solarGeneration: 4, janurjaTraded: 2, netGridDemand: 40, marketPrice: 7.80 },
  { time: '08:00', traditionalLoad: 58, solarGeneration: 18, janurjaTraded: 12, netGridDemand: 46, marketPrice: 7.40 },
  { time: '10:00', traditionalLoad: 72, solarGeneration: 45, janurjaTraded: 38, netGridDemand: 34, marketPrice: 6.30 },
  { time: '12:00', traditionalLoad: 80, solarGeneration: 78, janurjaTraded: 64, netGridDemand: 16, marketPrice: 5.90 },
  { time: '14:00', traditionalLoad: 85, solarGeneration: 82, janurjaTraded: 68, netGridDemand: 17, marketPrice: 6.10 },
  { time: '16:00', traditionalLoad: 75, solarGeneration: 42, janurjaTraded: 35, netGridDemand: 40, marketPrice: 6.80 },
  { time: '18:00', traditionalLoad: 92, solarGeneration: 6, janurjaTraded: 5, netGridDemand: 87, marketPrice: 8.20 },
  { time: '20:00', traditionalLoad: 88, solarGeneration: 0, janurjaTraded: 0, netGridDemand: 88, marketPrice: 8.50 },
  { time: '22:00', traditionalLoad: 65, solarGeneration: 0, janurjaTraded: 0, netGridDemand: 65, marketPrice: 7.60 }
];
