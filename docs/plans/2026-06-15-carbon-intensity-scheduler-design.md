# Design Document: Carbon-Intensity Forecaster & Smart-Appliance Scheduler

## 1. Overview & Goals
The goal of this feature is to introduce a carbon-aware scheduling interface to the Eco-Sync Nexus dashboard. By forecasting regional grid carbon intensity, users can schedule high-load household appliances (e.g., EV Chargers, Climate Control, Washing Machines) during periods of high clean-energy generation (wind/solar surplus on the grid).

The live simulator will automatically execute these schedules, toggle appliance states, and update carbon footprint parameters dynamically, demonstrating tangible environmental and economic savings.

---

## 2. Architecture & Data Model

### Database Changes
We will define a new model `ApplianceSchedule` in the Prisma schema and extend the `db` proxy wrapper to support the same schema locally for passwordless/offline environments.

```prisma
model ApplianceSchedule {
  id         String   @id @default(uuid())
  deviceName String   // Name of the scheduled appliance
  powerDraw  Float    // kW power draw
  startTime  String   // Simulated target hour (e.g., "03:00") or ISO date string
  duration   Float    // Run duration in hours (simulated)
  status     String   @default("pending") // "pending" | "running" | "completed" | "cancelled"
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
}
```

We will also update the local JSON mock database wrapper in `src/lib/db.ts` to implement equivalent fields and mock proxy endpoints.

---

## 3. API Endpoints

### 1. `/api/forecaster/grid` (GET)
Returns a 24-hour array of grid carbon intensity values (hour 0 to 23 of the current day) utilizing a double-peak sinusoidal model:
- **Troughs (Clean - low gCO2/kWh)**: Solar peak (11:00 AM - 3:00 PM) and late night (2:00 AM - 5:00 AM).
- **Peaks (Dirty - high gCO2/kWh)**: Morning surge (7:00 AM - 9:00 AM) and evening peak (6:00 PM - 9:00 PM).

### 2. `/api/forecaster/schedule` (GET, POST, DELETE)
- **GET**: Lists user schedules.
- **POST**: Creates a schedule for a specific device, power rating, start hour, and duration.
- **DELETE**: Cancels/deletes a schedule.

---

## 4. Frontend Components

### `CarbonSchedulerSection.tsx` (`src/components/CarbonSchedulerSection.tsx`)
A new interactive dashboard section comprising:
1. **Grid Carbon Pulse (SVG Chart)**:
   - Visualizes the 24h carbon intensity forecast curve.
   - Highlights zones: Clean (Green), Moderate (Amber), Peak (Red).
   - Tracks a vertical cursor reflecting the current **Simulated System Hour**.
2. **Visual Hour Selector & Savings Calculator**:
   - An interactive slider (0 to 23 hours).
   - Real-time calculator: selecting an hour immediately displays predicted carbon emissions (`gCO2`) and savings in kilograms of CO2 compared to running at the dirtiest grid slot.
3. **Appliance Schedule Creator**:
   - Select dropdown populated from registered devices (or initial devices like EV Charger, Washing Machine).
   - Configure duration (hours).
   - Submit button to write to the backend database.
4. **Schedule Queue**:
   - Lists pending and active scheduled runs with a delete/cancel trigger.

---

## 5. Live Simulation Loop Integration

### Simulated Clock Ticking
In `src/app/page.tsx`, we will manage a state variable `simulatedTime` (starting at the current system time, or looping 24 hours). 
The clock ticks forward inside the simulation loop:
- Each simulation tick (3s) increments the simulated time by 15 minutes.
- If simulated time crosses a pending schedule's start time, the state machine triggers:
  - Appliance is turned ON (`isOn = true` in devices array).
  - Schedule status becomes `running`.
  - Trigger a premium user-notification.
  - Log an automated action under the system logs console (`[AUTO] EV Charger started running during low-carbon slot`).
- When the duration expires, the device switches off (`isOn = false`) and status is marked `completed`.

---

## 6. Verification Plan
- **Backend Tests**: Verify API endpoints fetch data and update/delete database records successfully.
- **Mock DB Verification**: Validate mock-db.json writes and reads correctly in offline environments.
- **Simulation Validation**: Open the console dashboard and confirm simulated time increments, scheduled devices start automatically at the set hour, and shut off after the scheduled duration.
- **Visual Checks**: Ensure SVG forecast charts display crisp responsive curves in both light and dark modes.
