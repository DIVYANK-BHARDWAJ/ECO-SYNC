# ⚡ ECO-SYNC NEXUS ⚡
### Immersive Smart Microgrid Simulation & Decarbonization Ledger Console

```
 ████████╗ ██████╗  ██████╗      ███████╗██╗   ██╗███╗   ██╗ ██████╗
 ██╔═════╝██╔════╝ ██╔═══██╗     ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
 █████╗   ██║      ██║   ██║     ███████╗ ╚████╔╝ ██╔██╗ ██║██║     
 ██╔══╝   ██║      ██║   ██║     ╚════██║  ╚██╔╝  ██║╚██╗██║██║     
 ███████╗ ╚██████╗ ╚██████╔╝     ███████║   ██║   ██║ ╚████║╚██████╗
 ╚══════╝  ╚═════╝  ╚═════╝      ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
 
           ⚡ IMMERSIVE DECARBONIZATION LEDGER & CONSOLE ⚡
```

---

## 🚀 Project Overview

**Eco-Sync Nexus** is an immersive, enterprise-grade dashboard designed to simulate, optimize, and monetize residential smart microgrids. In modern electric grids, prosumers struggle to manage fluctuating electricity costs, maximize solar panel yield, and coordinate appliance runtime around periods of low-carbon electricity supply. 

Eco-Sync Nexus bridges the gap between hardware telemetry simulation, carbon accounting, and decentralized decentralized finance (DeFi) incentives. It integrates:
* 🎛️ **Cyberpunk Telemetry Dashboard**: Complete with custom cursors, ambient lighting, scanline overlay, and interactive widgets.
* 📈 **Double-Sinusoidal Carbon Forecast Engine**: Diurnal grid carbon intensity prediction for automated smart scheduling.
* 🔋 **PV Solar & Storage Physics Loop**: Real-time battery state-of-charge calculation synced at 300x speed.
* ⛓️ **Web3 Gasless Settlements**: Peer-to-peer energy monetization through MetaMask signature verification and backend Ethereum Sepolia contract execution.
* 💬 **Context-Aware AI Assistant**: Dynamically synchronized Botpress chatbot reading real-time metrics and estimated monthly billing status.
* 🛡️ **Hard Budget Override**: Automated device safety shutdown protocol triggered on billing limit exceedances.

---

## 🗺️ System Architecture

The following sequence diagram outlines the end-to-end data flows, starting from prosumer interactions on the Next.js frontend, progressing through the 300x clock simulation, and settling on the Ethereum Sepolia blockchain:

```mermaid
sequenceDiagram
    autonumber
    actor User as Prosumer (MetaMask)
    participant UI as Dashboard UI (Next.js)
    participant Sim as Browser Sim Leader (300x)
    participant API as Next.js API Routes
    participant DB as PostgreSQL (Neon via Prisma)
    participant Chain as Sepolia Contract (EcoToken.sol)

    User->>UI: Toggle appliance / Set schedule
    UI->>DB: Save appliance schedule / state
    Sim->>Sim: Advance clock (300x speed) & process battery charge/discharge
    Sim->>UI: Update rolling metrics (solar gen, battery level)
    User->>UI: Settle energy sale (amount kWh)
    UI->>User: Prompt MetaMask signature
    User->>UI: Returns signed message
    UI->>API: POST /api/trading/sell {userAddress, amount, price, signature}
    API->>API: Verify cryptographic signature (Ethers.js)
    API->>Chain: Mint ECO tokens to user address (Server Wallet Signer)
    Chain->>API: Returns Transaction Hash
    API->>DB: Log Transaction (hash, amount, price, total)
    API->>DB: Create user notification alert
    API->>UI: Return Transaction Hash
    UI->>User: Display success banner & transfer ECO to wallet
```

---

## 💎 Core Feature Modules

### 1. Passwordless Secure OTP Engine
* **Purpose**: frictionless, high-security email login & sign-up without passwords.
* **Mechanism**: Generates 4-digit codes, dispatches HTML verification templates, and issues signed secure HttpOnly JWT cookies.
* **Dynamic Design**: Randomly selects from **7 highly styled, cyberpunk HTML email templates** (e.g. *Secure Net Protocol*, *Horizon Grid Link*, *Quantum Core Calibration*, *Ledger Settlement*, *Aether Solar Protocol*, *Smart Automation Grid*, *Analytics Pulse*).
* **Delivery Fallback Pipeline**: 
  1. Brevo HTTP API
  2. SMTP / Nodemailer
  3. Resend API
  4. Local Developer Console Mock Log

### 2. Double-Sinusoidal Carbon Forecast Engine
* **Purpose**: Generates a 24-hour diurnal grid carbon intensity curve to highlight peak pollution hours vs wind/solar clean energy surplus windows.
* **Mathematical Formula**:
  $$\text{Carbon Intensity} = \sin((Hour - 3) \times \frac{2\pi}{24}) \times 0.45 + \sin((Hour - 13) \times \frac{4\pi}{24}) \times 0.55$$
* **Grid Modeling**: Simulates a standard peaker plant grid model, raising emissions during morning (7:00 AM - 9:00 AM) and evening (6:00 PM - 9:00 PM) peaks up to `450 - 520 gCO2/kWh` and dipping during midday/overnight clean winds down to `60 - 120 gCO2/kWh`.

### 3. Grid-Aware Carbon Scheduler & Appliance Queue
* **Purpose**: Coordinates heavy appliance loads (EV Charger, HVAC, Climate Control) around low-carbon intervals.
* **Diagnostics**: Calculates deferred carbon weight (in kilograms saved vs peaker plant peaks) and computes the required battery storage allocation.
* **Overdraw Alert**: Warns users if their scheduled appliance draw exceeds available battery charge, indicating the exact portion that will pull directly from the grid.
* **Simulated Execution**: Triggers appliance activation automatically when the 300x fast-forward clock hits the start window.

### 4. Real-Time Solar & Storage Simulator
* **Purpose**: Models physical solar panels, home loads, and battery storage levels.
* **Net Power Formula**:
  $$NetPower = SolarGeneration - TotalLoad$$
* **Charging Loop**: If Net Power is positive, surplus charges the home battery (applying a 95% efficiency factor). If the battery is full and "Grid Sellback" is enabled, exports surplus back to the utility grid for instant simulated payouts.
* **Discharging Loop**: If Net Power is negative, discharges the battery (with 95% efficiency). If the battery is fully depleted, falls back to draw directly from the grid.

### 5. On-Chain P2P Energy Exchange
* **Purpose**: Tokens rewards (`ECO`) are minted directly to MetaMask wallets in exchange for discharged battery energy.
* **Gasless Web3 Relaying**: Next.js API acts as a Web3 transaction relayer. The server verifies MetaMask signatures (`ethers.verifyMessage`) and executes on-chain minting on Sepolia using gas reserves funded by a backend deployer wallet, shielding prosumers from network fees.
* **Blockchain Contract**: Built using a custom Solidity `EcoToken` contract.

### 6. Hard Session Budget Disconnect Watchdog
* **Purpose**: Safeguards prosumers from billing spikes.
* **Logic**: A 1-second background interval loop computes real-time costs:
  $$Cost = SessionEnergyConsumed \times CostFactor$$
* **Disconnect Routine**: Once the user-defined budget threshold is reached:
  1. Instantly forces all active appliances off (`isOn = false`).
  2. Triggers an emergency terminal dashboard alert.
  3. Dispatches a database notification.
  4. Emails the user a security override notice.

### 7. CRT-Scanline Nexus Terminal Console
* **Purpose**: System console logging telemetry, schedules, and token transactions.
* **Aesthetics**: Retro green-phosphor CRT design with scanline layers, scrolling logs, and warning indicators.
* **Web Audio API**: Plays customized synthesizer alert audio (synthesizing a sawtooth wave ramping down from A5 to E4) to mimic retro consoles without large file payloads.

### 8. Context-Aware AI Chatbot (Botpress)
* **Purpose**: Injects a conversational agent that reads real-time dashboard states.
* **Synced Properties**: Includes `batteryLevel`, `batteryCapacity`, `solarGeneration`, `gridDependency`, `walletBalance`, `estimatedMonthlyBill`, and lists of `activeDevices`.
* **Billing Context Sync**: Persists cumulative energy draw in `localStorage` across page transitions, feeding live estimated bills straight into chatbot prompts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | Next.js 14.2.3 (App Router), React 18, TypeScript, Tailwind CSS, PostCSS |
| **Animation & Style**| Framer Motion, Lucide React, Custom CSS CRT overlays |
| **Database** | PostgreSQL (Neon serverless cloud), Prisma ORM client |
| **Web3 Core** | Solidity (`solc 0.8.20`), Ethers.js v6.16.0, MetaMask browser provider |
| **Communications** | Resend API, Brevo API, Nodemailer, Botpress Webchat |
| **Audio** | Web Audio API (real-time sawtooth synthesizer) |

---

## 💾 Database Schema

Prisma ORM models and relationships within PostgreSQL:

```
                  ┌──────────────────────┐
                  │         USER         │
                  ├──────────────────────┤
                  │ id (PK)              │◄──┐
                  │ email (Unique)       │   │
                  │ name                 │   │
                  │ bio                  │   │
                  │ avatarUrl            │   │
                  │ themeMode            │   │
                  │ costFactor           │   │
                  │ batteryCap           │   │
                  │ messageStyle         │   │
                  └──────────────────────┘   │
                     │      │      │          │
         ┌───────────┘      │      └─────┐    │
         │                  │            │    │ (Cascade Delete)
         ▼                  ▼            ▼    │
┌──────────────┐   ┌─────────────┐   ┌───────────────────┐
│ NOTIFICATION │   │ TRANSACTION │   │ APPLIANCE_SCHED   │
├──────────────┤   ├─────────────┤   ├───────────────────┤
│ id (PK)      │   │ id (PK)     │   │ id (PK)           │
│ userId (FK)  │   │ hash (Unique│   │ deviceName        │
│ message      │   │ amount      │   │ powerDraw         │
│ createdAt    │   │ price       │   │ startTime         │
│              │   │ total       │   │ duration          │
│              │   │ userId (FK) │   │ status            │
│              │   │             │   │ userId (FK)       │
└──────────────┘   └─────────────┘   └───────────────────┘
```

---

## 📡 API Reference Specifications

| Endpoint | Method | Auth | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/check-user` | POST | None | `{ email }` | Query `User` unique record; Returns exists flag. |
| `/api/auth/otp/send` | POST | None | `{ email, isSignUp }` | Generates 4-digit code. Deletes past records. Saves to `OtpVerification`. Dispatches cyberpunk HTML email. |
| `/api/auth/otp/verify` | POST | None | `{ email, code }` | Verifies matching code. Deletes record on consumption. Creates user on signup. Sets signed JWT session cookie. |
| `/api/auth/profile` | GET | JWT | None | Fetches active user record based on decoded JWT. |
| `/api/auth/profile` | PATCH | JWT | `{ name, bio, avatarUrl, themeMode, costFactor, batteryCap, messageStyle }` | Updates profile properties. Restricts battery changes to active storage limits. |
| `/api/auth/signout` | POST | JWT | None | Clears JWT session cookie. |
| `/api/auth/budget-exceeded` | POST | JWT | `{ spent, target }` | Dispatches security alert notification to the database. Emails the user via Brevo/SMTP/Resend. |
| `/api/auth/test-notify` | POST | JWT | None | Sends a test notification based on the user's selected email layout. |
| `/api/forecaster/grid` | GET | JWT | None | Calculates double-sinusoidal forecast curve for grid carbon intensity. |
| `/api/forecaster/schedule` | GET | JWT | None | Retrieves all scheduled runs for the logged-in user. |
| `/api/forecaster/schedule` | POST | JWT | `{ deviceName, powerDraw, startTime, duration }` | Creates schedule record in `ApplianceSchedule`. Dispatches schedule notification alert. |
| `/api/forecaster/schedule` | DELETE| JWT | `?id=uuid` | Deletes the specified schedule from the queue. |
| `/api/forecaster/schedule` | PATCH | JWT | `{ id, status }` | Updates schedule status (`pending`, `running`, `completed`). Activates appliance when running. |
| `/api/trading/sell` | POST | JWT | `{ userAddress, amount, price, signature }` | Verifies Web3 signature. Connects to Sepolia and mints `ECO` tokens. Saves record to `Transaction`. |
| `/api/trading/history` | GET | JWT | None | Fetches all sales history for the user, sorted newest first. |
| `/api/notifications` | GET | JWT | None | Fetches active system alerts for the user, sorted newest first. |
| `/api/notifications` | DELETE| JWT | None | Deletes all notifications for the user. |

---

## ⚙️ Environment Configurations

Create a `.env.local` file in the root directory. Copy and configure the following variables:

```env
# Database Credentials
DATABASE_URL="postgresql://username:password@localhost:5412/ecosync"

# Auth Session Keys
SESSION_SECRET="your-super-long-session-secret-key"

# Web3/Sepolia Configuration
NEXT_PUBLIC_ECO_TOKEN_ADDRESS="0x..." # Deployed contract address
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/your-api-key"
BLOCKCHAIN_PRIVATE_KEY="your-backend-relayer-private-key-with-gas"

# Email Services (Brevo / Nodemailer / Resend)
RESEND_API_KEY="re_..."
BREVO_API_KEY="xkeysib-..."
SMTP_USER="user@example.com"
SMTP_PASSWORD="smtp-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SENDER="sender@example.com"

# Offline Development Flag (runs in mock mode without DB or Email API services)
FORCE_OFFLINE="false"
```

---

## 🔧 Installation & Local Setup

### Prerequisites
* Node.js v18+
* npm or yarn
* PostgreSQL Instance (or online Neon Serverless URL)
* Web3 Wallet (e.g. MetaMask extension)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/DIVYANK-BHARDWAJ/eco-sync.git
cd eco-sync
npm install
```

### 2. Compile and Deploy Smart Contracts
1. Compile the Solidity contract:
   ```bash
   node scripts/compile.js
   ```
2. Verify artifacts exist in `artifacts/EcoToken.json`.
3. Set your RPC URL and Private Key in `.env.local`.
4. Deploy to the Sepolia Network:
   ```bash
   node scripts/deploy-eco-token.js
   ```
5. Copy the logged contract address and update `NEXT_PUBLIC_ECO_TOKEN_ADDRESS`.

### 3. Database Migration
Deploy your PostgreSQL database schema with Prisma ORM:
```bash
npx prisma db push
npx prisma generate
```

### 4. Running the Development Server
Launch the application locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the telemetry console.

---

## 🧪 Developer Testing Suite

Eco-Sync contains a dedicated testing suite in `scripts/` to validate schema configurations, payloads, API logic, and data mappings:

| Test Script | Command | Validation Scope |
| :--- | :--- | :--- |
| **Botpress Context** | `npx tsx scripts/test-botpress.ts` | Validates session context mappings and Indian Rupee/ECO currency formatters. |
| **Grid Forecaster** | `npx tsx scripts/test-grid-api.ts` | Tests diurnal emissions calculations and double-sinusoidal arrays. |
| **Prisma Schema** | `npx tsx scripts/test-prisma-schema.ts` | Validates model integrity and database schema updates. |
| **OTP Templates** | `npx tsx scripts/test-message-templates.ts` | Asserts HTML outputs of the 7 dynamic email layout modes. |
| **Scheduler API** | `npx tsx scripts/test-schedule-api.ts` | Tests API queue additions, deletion logic, and state overrides. |
| **Profile Configurations** | `npx tsx scripts/test-profile-update-style.ts` | Asserts layout preference updates and validation overrides. |

To run the full suite:
```bash
npx tsx scripts/test-prisma-schema.ts
npx tsx scripts/test-botpress.ts
npx tsx scripts/test-grid-api.ts
npx tsx scripts/test-schedule-api.ts
```

---

## ⚡ Performance Optimizations

1. **Multi-Tab Simulation Leadership Broker**: Using local storage timestamps and tab IDs, tabs negotiate a single "Simulation Leader". This leader runs the 300x fast-forward clock calculations, while other tabs read and update UI grids in passive sync mode to prevent performance overhead.
2. **Asynchronous Non-blocking Email Pipeline**: Dispatches email authentication codes and budget alerts in background threads to avoid SMTP latency holding back Next.js API response speeds.
3. **Prisma Client Cache Capping**: Limits transaction logs to the last 100 entries to prevent DB load deterioration over time.
4. **Dynamic Telemetry Throttling**: Logs query schedules are throttled to a 3-second polling delay, ensuring grid data stays fresh without spamming Neon serverless connections.
