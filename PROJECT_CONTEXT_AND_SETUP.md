# ⚡ JanUrja — Complete Project Context & Local Run Guide

> **"UPI for Electricity"** — Autonomous Peer-to-Peer Rooftop Solar Energy Trading  
> **Track**: Track 3: Reinvent Digital Public Infrastructure For Billions (NITK Surathkal Hackathon)  
> **Team**: Nishant Kumar Sah (Lead) • Amit Kumar • Yash Patel • Aditya Raushan  
> **Protocol Standard**: Beckn Protocol v1.1.0 / Unified Energy Interface (UEI)  

---

## 📌 Table of Contents
1. [Executive Summary & Core Concept](#1-executive-summary--core-concept)
2. [Instant Quickstart (Run on Any Local Machine)](#2-instant-quickstart-run-on-any-local-machine)
3. [Environment Configuration (`.env`)](#3-environment-configuration-env)
4. [Dual-Engine Architecture (Live Cloud vs. Offline Fallback)](#4-dual-engine-architecture-live-cloud-vs-offline-fallback)
5. [Supabase Backend & Database Setup](#5-supabase-backend--database-setup)
6. [Core Features & Hackathon Centerpieces](#6-core-features--hackathon-centerpieces)
7. [Repository File Map](#7-repository-file-map)
8. [The 90-Second Hackathon Judge Pitch & Demo Flow](#8-the-90-second-hackathon-judge-pitch--demo-flow)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Executive Summary & Core Concept

**JanUrja** unbundles electricity distribution from monolithic state utility monopolies (DISCOMs) in the exact same manner that **UPI (Unified Payments Interface)** unbundled retail payments from traditional banking silos.

### The Problem
* Rooftop solar adopters (**Prosumers**) sell excess electricity back to utilities under net metering at heavily discounted feed-in tariffs (e.g., ₹2.50/kWh) with long payment settlement delays.
* Nearby commercial entities and households (**Consumers**) suffer high retail grid tariffs (e.g., ₹7.50 to ₹8.50/kWh).
* Utilities face severe grid imbalance ("Duck Curve" load spikes) and transmission stress.

### The Solution: JanUrja via Beckn / UEI
* Prosumers list surplus energy; consumers express purchase demand.
* Autonomous discovery, dynamic pricing negotiation, and contractual handshakes take place over the **Beckn Protocol (Unified Energy Interface - UEI)**.
* Financial settlement happens in real time via **mock UPI AutoPay**.
* Physical electrons flow over the utility’s existing 11kV distribution lines.
* The utility (**MESCOM**) automatically earns an itemized **Wheeling Transit Fee (₹0.15/kWh)** with zero collection risk.

---

## 2. Instant Quickstart (Run on Any Local Machine)

Follow these steps to run JanUrja on any Windows, macOS, or Linux computer.

### Step 1: Prerequisites
Ensure you have **Node.js** (v18.0 or higher) and **npm** installed.
Verify by running:
```bash
node -v
npm -v
```

### Step 2: Clone or Copy Project Directory
Navigate into the project root:
```bash
cd "NITK Surathkal JanUrja Hackathon"
```

### Step 3: Install Dependencies
Install all required packages:
```bash
npm install
```

### Step 4: Configure Environment File
Create a `.env` file in the project root (see Section 3 for the pre-configured keys):
```bash
# On Linux / macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

### Step 6: Verify Production Build (Optional)
To verify bundling and check for any syntax or module issues:
```bash
npm run build
npm run preview
```

---

## 3. Environment Configuration (`.env`)

JanUrja is designed to connect to live **Supabase Cloud**, but also has an automatic **100% offline fallback**.

Save the following in `.env` in the root folder:

```env
# ==============================================================================
# JanUrja Environment Configuration
# ==============================================================================

# Live Supabase Cloud Project Credentials
VITE_SUPABASE_URL=https://nlzsitvoxnbjohtefwvq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5senNpdHZveG5iam9odGVmd3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzOTc4NzgsImV4cCI6MjEwNTk3Mzg3OH0.ZYeiT3gSrbO6vKKxj3vAZkw7Wstr2lBzu0fxmpxtSxE

# Application Port (Vite default is 5173)
PORT=5173
```

> **Security Note**: This `.env` file is excluded from Git via `.gitignore`. The anon public key is safe for client-side queries protected by Supabase Row-Level Security (RLS).

---

## 4. Dual-Engine Architecture (Live Cloud vs. Offline Fallback)

JanUrja guarantees **zero demo failure during hackathon presentations**:

```
                 ┌────────────────────────────────┐
                 │       JanUrja Client App       │
                 │          (React 19)            │
                 └──────────────┬─────────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
   [Live Supabase Cloud]               [Mock Reactive Engine]
 - PostgreSQL Database               - LocalStorage Persistence
 - Supabase Auth (Email/Pass)        - Reactive In-Memory Pub/Sub
 - Row-Level Security (RLS)          - Auto-generated Telemetry
 - Realtime Subscriptions            - 1-Click Persona Switcher
```

1. **Live Supabase Mode**: If valid credentials are in `.env`, the app reads/writes to PostgreSQL and authenticates via Supabase Auth.
2. **Offline Resilient Mode**: If the computer is disconnected from the internet or Supabase is unreachable, JanUrja automatically falls back to [`src/services/mockDatabase.js`](file:///c:/Users/nisha/Hackathon/NITK%20Surathkal%20JanUrja%20Hackathon/src/services/mockDatabase.js). All Beckn protocol states, trades, and wallet balances persist seamlessly in the browser's `localStorage`.
3. **Instant Persona Switcher**: In the navigation bar and settings drawer, testers can switch between active microgrid personas (NITK Solar Research Park, Priya Nayak, MESCOM Regulator).

---

## 5. Supabase Backend & Database Setup

If you are connecting your own Supabase project:

### 1. Execute Database Schema
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy and run the entire SQL script from [`supabase/schema.sql`](file:///c:/Users/nisha/Hackathon/NITK%20Surathkal%20JanUrja%20Hackathon/supabase/schema.sql).

### 2. Configured Database Tables
* **`profiles`**: User identities, role (`consumer`, `producer`, `prosumer`), solar capacity (kW), UPI ID, grid zone, and wallet balance.
* **`energy_nodes`**: Smart meter telemetry, surplus/deficit kWh, generation rate, and 11kV feeder zone.
* **`energy_offers`**: Marketplace listings with pricing mode (`agentic` vs `fixed`) and natural language bidding rules.
* **`orders`**: Transactional Beckn contracts tracking the 5 core protocol states (`DISCOVERED` ➔ `QUOTED` ➔ `AUTHORIZED` ➔ `ALLOCATED` ➔ `SETTLED`).
* **`protocol_events`**: Audit log of all BAP ➔ BPP Beckn JSON payloads.
* **`transactions`**: Settled trade records with payer/payee VPAs, energy units, and CO₂ offset (kg).

### 3. Configure Supabase Auth URL Configuration
In your Supabase Dashboard:
1. Navigate to **Authentication ➔ URL Configuration**.
2. Set **Site URL**: `http://localhost:5173`
3. Add to **Redirect URLs**:
   * `http://localhost:5173`
   * `http://localhost:5173/**`

---

## 6. Core Features & Hackathon Centerpieces

### 1. Beckn Protocol / Unified Energy Interface (UEI) Engine
* Full 8-step Beckn handshake cycle:
  `search` ➔ `on_search` ➔ `select` ➔ `on_select` ➔ `init` ➔ `confirm` ➔ `allocate` ➔ `settle`.
* **Live Protocol Monitor Drawer**: Real-time stream of network packets.
* **Beckn JSON Payload Modal**: Inspect formatted raw JSON packets for any event, with 1-click clipboard copy.

### 2. Agentic Pricing & Trading Engine
* **Natural Language Bidding Rules**: Prosumers can write rules like:  
  `"Undercut grid tariff by 15% and stay above ₹5.50/unit"`  
  The engine parses rules and calculates dynamic clearing prices.
* **Limit Order Buyer Protection**: Consumers can place automated buy orders with ceiling price caps.

### 3. Directional 11kV Microgrid Compass
* Physical topology of the Surathkal coastal grid:
  * **S1-North**: NITK Campus & Research Park (Solar prosumer)
  * **S2-East**: Beach Road & Main Market feeder
  * **S3-South**: Srinivasnagar Residential & EV Station (Priya Nayak)
  * **S4-West**: Coastal Fishing Harbour & Cold Storage
  * **Central Hub**: MESCOM 110kV Primary Substation

### 4. 90-Second Demo Showcase
* Interactive automated sequence with speed controls (1x, 2x, Step-by-Step).
* **Dual Flow Visualizer**:
  * **Green Flow**: Electron transfer from NITK Solar Park ➔ Srinivas EV Station.
  * **Gold Flow**: Financial UPI micro-settlement from Priya Nayak ➔ NITK Solar Park.
* **Verified Energy Receipt**: Displays units traded, wheeling fee paid to MESCOM, UPI reference, and 4.59 kg CO₂ avoided.

### 5. Institutional DISCOM / Regulator Dashboard
* **Duck Curve Mitigation**: Analytics illustrating midday solar load peak shaving and evening ramp flattening.
* **Feeder Congestion Heatmap**: Real-time load indicators across feeder lines.
* **Guaranteed Wheeling Revenue**: Displays utility transit fee revenue earned with zero billing defaults.

---

## 7. Repository File Map

```
├── .env                       # Active environment credentials (ignored by Git)
├── .env.example               # Template environment configuration
├── package.json               # Node packages and build scripts
├── vite.config.js             # Vite 8 configuration with React & Tailwind plugins
├── index.html                 # HTML entry point with meta tags & fonts
│
├── supabase/
│   └── schema.sql             # Complete PostgreSQL database schema & RLS rules
│
└── src/
    ├── App.jsx                # Main application container, router, and modal mounts
    ├── main.jsx               # React 19 root bootstrap
    │
    ├── context/
    │   └── AppContext.jsx     # Global state: Auth, session, active views, DB syncing
    │
    ├── data/
    │   └── initialData.js     # Default profiles (NITK, Priya Nayak, MESCOM), nodes, & offers
    │
    ├── services/
    │   ├── supabaseClient.js  # Supabase client wrapper with auth methods
    │   ├── mockDatabase.js    # Resilient offline database with localStorage pub/sub
    │   ├── becknProtocol.js   # Beckn / UEI 8-step handshake state machine
    │   └── agenticEngine.js   # AI natural language rule parser & dynamic clearing logic
    │
    ├── views/
    │   ├── HomeView.jsx       # Prosumer overview, smart meter telemetry, quick stats
    │   ├── BuyView.jsx        # Buy energy order form with limit-order protection
    │   ├── SellView.jsx       # Sell energy listing with Agentic pricing configuration
    │   ├── MarketplaceView.jsx# Active P2P offers, feeder filtering, direct order initiation
    │   ├── DemoFlowView.jsx   # 90-second animated centerpiece showcase (NITK to Priya Nayak)
    │   ├── DiscomDashboardView.jsx # Regulator duck-curve & feeder load analytics
    │   ├── AuthView.jsx       # Persona profile management & smart meter linking
    │   └── auth/
    │       └── AuthPages.jsx  # Complete Supabase Email Auth suite (Login, Signup, Reset)
    │
    └── components/
        ├── Navbar.jsx         # Sticky header with navigation, wallet pill, & persona dropdown
        ├── DirectionalCompass.jsx # 11kV feeder grid compass visualizer
        ├── EnergyFlowAnimation.jsx # Dual electron (green) & UPI financial (gold) flow
        ├── LiveProtocolMonitor.jsx # Slide-out drawer tracking real-time Beckn packets
        ├── BecknPayloadModal.jsx # Formatted JSON inspector for protocol events
        ├── ReceiptModal.jsx   # Digital energy receipt with QR code & carbon offset badge
        └── SettingsModal.jsx  # Supabase cloud connection & offline mode switcher
```

---

## 8. The 90-Second Hackathon Judge Pitch & Demo Flow

When presenting to judges or reviewers, follow this precise demo pathway:

1. **Step 1: Open the App & Explain the Vision (0–15s)**
   * Open `http://localhost:5173`.
   * *"Electricity distribution is trapped in monolithic 19th-century utility monopolies. JanUrja is UPI for Electricity—an open decentralized public infrastructure standard based on the Beckn protocol."*
2. **Step 2: Persona Context (15–30s)**
   * Show **NITK Solar Research Park** (25 kW Institutional Rooftop Solar generating clean midday surplus).
   * Show **Priya Nayak** (Fast EV commuter charging station in Srinivasnagar requiring daytime power).
3. **Step 3: Launch the 90-Second Demo View (30–60s)**
   * Click **"90s Demo"** in the top navigation bar.
   * Hit **"Start Automated Simulation"**.
   * Watch the Beckn handshake advance:
     `DISCOVERED ➔ QUOTED ➔ AUTHORIZED ➔ ALLOCATED ➔ SETTLED`.
   * Point out the **Dual Flow Animation**: Green electrons moving from NITK Solar to Priya Nayak, and Golden UPI payment settling simultaneously.
4. **Step 4: Developer Protocol Monitor (60–75s)**
   * Click the **"Beckn UEI Stream"** floating pill in the bottom right.
   * Expand any handshake event (`search`, `on_search`, `confirm`) to show real-time Beckn v1.1.0 JSON payloads.
5. **Step 5: Institutional DISCOM Dashboard (75–90s)**
   * Click **"Regulator / DISCOM"** in the navbar.
   * Show the **Duck Curve Mitigation Chart**: Solar generation shaves daytime peak grid load.
   * Highlight the financial metric: **MESCOM earns ₹0.15/kWh wheeling fee** on every trade with guaranteed settlement and zero collection losses.

---

## 9. Troubleshooting & FAQs

### Q: Port 5173 is already in use
**Fix**: Vite will automatically select the next free port (e.g., `http://localhost:5174`). Alternatively, kill the running process:
```bash
# Windows:
npx kill-port 5173

# Linux/macOS:
lsof -ti :5173 | xargs kill -9
```

### Q: How do I test the application without creating a Supabase account?
**Fix**: On the Sign-Up or Onboard Solar Node screen, you can register any email or name to generate an immediate verified session with local database persistence, or switch personas inside the app from the profile menu.

### Q: What if Supabase gives a CORS or Invalid Redirect error?
**Fix**: Verify that `http://localhost:5173` is listed under **Authentication > URL Configuration > Redirect URLs** in your Supabase project dashboard.

### Q: How do I clear the mock database and restore initial values?
**Fix**: Open browser Developer Tools (F12) ➔ Console, and run:
```javascript
localStorage.clear();
location.reload();
```

---

*JanUrja — Digital Public Infrastructure for Billions • Built for NITK Surathkal Hackathon Track 3*
