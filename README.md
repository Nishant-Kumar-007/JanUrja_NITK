# JanUrja — Universal Energy Interface (UEI)

> **"UPI for Electricity"** — Autonomous Peer-to-Peer Solar Energy Trading  
> **Hackathon**: Build for Billions, NITK Surathkal  
> **Track Selected**: Track 3: Reinvent Digital Public Infrastructure For Billions  
> **Team Members**: Nishant Kumar Sah (Lead) • Amit Kumar • Yash Patel • Aditya Raushan  
> 📖 **Portable Setup Guide**: See [PROJECT_CONTEXT_AND_SETUP.md](file:///c:/Users/nisha/Hackathon/NITK%20Surathkal%20JanUrja%20Hackathon/PROJECT_CONTEXT_AND_SETUP.md) to run on any local machine.

---

## ⚡ What is JanUrja?

**JanUrja** unbundles electricity distribution from monolithic state DISCOMs the exact same way **UPI** unbundled payments from traditional banks.

Built on the open-source **Beckn Protocol** (via India's emerging **Unified Energy Interface / UEI** DPI standard), JanUrja allows rooftop solar prosumers to discover, negotiate, and sell surplus energy directly to deficit neighbors within localized 11kV feeder microgrid segments.

### The Core Scenario
* **Ramesh Rao** (IT engineer on Beach Road, Surathkal) has a **3.2 kW** rooftop solar PV system generating excess units during sunny weekday hours while he is at the office.
* **Suresh Shetty** (runs Annapoorna Bakery in the Main Market next door) consumes heavy electricity during peak baking hours and pays high commercial DISCOM tariffs (₹7.80/kWh).
* **JanUrja** matches Ramesh and Suresh over the Beckn open network, executes an itemized tariff contract (₹6.20/kWh + ₹0.15 wheeling transit fee), and settles the micro-transaction instantly via **mock UPI AutoPay** while the state utility's physical lines transport the electrons.

---

## 🏆 Key Features & Innovation

1. **Zerodha-Inspired Trading Bar & Standalone Order Placement**:
   - **Buy Energy Page**: Standalone order screen featuring quantity steppers, optional limit-order price guards ("Only buy if rate < ₹X/unit"), itemized wheeling fee breakdown, and real-time protocol state progression.
   - **Sell Solar Page**: Surplus listing with an **Agentic Pricing Engine** allowing natural language bidding rules (*"Undercut grid tariff by 15% and stay above ₹5.50/unit"*).
   - **Compact Ticker Strip**: Real-time ticker showing local clearing rate, grid frequency (49.98 Hz), user surplus/deficit, and carbon offset.

2. **Directional Microgrid Compass Topology (Reflecting Architecture Sketch)**:
   - S1-North (NITK Campus & Research Park)
   - S2-East (Surathkal Main Market & Beach Road — Ramesh & Suresh)
   - S3-South (Srinivasnagar Residential & EV Charging Corridor)
   - S4-West (Coastal Harbour & Cold Storage)
   - Central Hub (MESCOM 110kV Substation & Clearing Bus)
   - Interactive filtering allows inspecting physical grid feeder segments.

3. **The 90-Second Demo Centerpiece**:
   - Automated sequence with playback speed control (1x, 2x, step-by-step).
   - Visibly steps through Beckn states: `DISCOVERED` ➔ `QUOTED` ➔ `AUTHORIZED` ➔ `ALLOCATED` ➔ `SETTLED`.
   - **Dual Flow Visualizer**: Simultaneous animated green Electron Flow (producer ➔ consumer) and golden Financial UPI Flow (consumer ➔ producer) merging at settlement.
   - Generates persistent **Energy Receipt** with verified CO₂ avoided (1.62 kg) and digital QR certificate.

4. **Live Developer Protocol Monitor**:
   - Real-time drawer tracking Beckn handshake events (`search`, `on_search`, `select`, `on_select`, `init`, `confirm`, `allocate`, `settle`).
   - Interactive Beckn network mesh graph and raw JSON payload inspector.

5. **Regulator / DISCOM Oversight Dashboard**:
   - Recharts visual analytics showing **Duck Curve Mitigation**, grid congestion, and peak load curtailment.
   - Proves economic incentive for utilities: DISCOM earns **₹0.15/kWh wheeling fees** on every transaction with zero collection risk.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Canvas Confetti.
- **Backend**: Supabase (PostgreSQL with Row-Level Security, Supabase Auth, and Supabase Realtime).
- **Resilient Fallback Mode**: Ships with dual-layer database client (`supabaseClient.js` + `mockDatabase.js`). Works **100% offline out-of-the-box** with full local storage persistence and real-time reactive event pub/sub, while connecting seamlessly to Supabase Cloud whenever credentials are provided.
- **Protocol**: Beckn Protocol v1.1.0 (Unified Energy Interface schema).

---

## 🚀 Quickstart Guide

### 1. Install & Run Locally
```bash
# Clone or navigate to the repository
cd "NITK Surathkal JanUrja Hackathon"

# Install dependencies (already installed in workspace)
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 2. Optional: Connect Live Supabase Cloud
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase and paste the contents of `supabase/schema.sql`.
3. In the JanUrja web app, click the **Settings ⚙️** icon in the navbar.
4. Paste your **Supabase URL** and **Anon Public Key**, then click **Save & Connect**.

---

## 🏛️ Schema Architecture (`supabase/schema.sql`)

* `profiles`: User accounts extending auth; roles (`prosumer`, `consumer`, `both`, `regulator`), solar capacity, UPI VPA.
* `energy_nodes`: Smart meter telemetry, surplus/deficit kWh, renewable purity %, grid frequency.
* `energy_offers`: Marketplace listings, pricing mode (`agentic` vs `fixed`), natural language rules.
* `orders`: Transactional Beckn contracts tracking protocol state (`DISCOVERED` ➔ `SETTLED`).
* `protocol_events`: Real-time audit log of all BAP/BPP handshake payloads driving the live monitor.
* `transactions`: Mock UPI settlement records, payer/payee VPAs, CO₂ avoided (kg).
