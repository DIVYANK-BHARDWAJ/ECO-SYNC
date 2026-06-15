# Design Document: Twilio Integration (WhatsApp/SMS Alerts & Mobile OTP Login)

## 1. Overview & Goals
The goal of this feature is to extend Eco-Sync Nexus's authentication and alert mechanics with Twilio REST API integration:
1. **WhatsApp & SMS Alerts**: Send real-time transaction updates on prosumer trades and automated schedule starts.
2. **Mobile OTP Login**: Allow operators to sign up and sign in using their mobile number. Verify via single-use verification tokens sent as SMS text messages using 8 cyberpunk-themed layouts.

---

## 2. Architecture & Data Model

### Shadow Email Mapping Pattern
To support mobile login without requiring destructive schema changes or breaking existing session configurations, we will implement a virtual **Shadow Email** mapping layer:
*   If an input identifier is recognized as a phone number (e.g. starts with `+` or contains only digits like `+919876543210`), it will map to a shadow email: `${phoneNumber}@phone.ecosync.io`.
*   The database `User` table and `OtpVerification` table will treat this shadow email as the primary key/unique identifier.
*   The `phoneNumber` column on the `User` record will be populated with the original phone number.
*   This pattern ensures 100% compatibility with existing auth endpoints, database indexes, and secure HttpOnly cookie session decryptors.

### Database Schema Changes
Add phone fields on `User`:
```prisma
model User {
  ...
  phoneNumber      String?  @default("")
  notificationType String?  @default("whatsapp") // "whatsapp" | "sms" | "none"
}
```

---

## 3. Twilio SMS OTP Templates
When an SMS OTP is requested, the system will randomly choose one of the following 8 cyber-themed SMS layouts:
1. **Minimalist Tech**: `🔑 ECO-SYNC ACCESS:\nYour system authorization key is: {code}\n\nSecurity clearance expires in 10 minutes. Do not share.`
2. **Cyberpunk Gate**: `⚡ [NEXUS ACCESS GATE]\nIdentity verification requested.\nSecure key: {code}\nT-minus 10 minutes until session token expiration.`
3. **Solar Uplink**: `🌱 ECO-SYNC UPLINK:\nAccess the clean energy grid with verification key: {code}\n\nThank you for balancing the local microgrid!`
4. **Web3 Ledger**: `🔗 [ECO CORE SECURE]\nWeb3 transaction relayer authorization key: {code}\n\nKeep your private keys secure.`
5. **Microgrid Diagnostics**: `📡 [MICROGRID CALIBRATION]\nDiagnostic uplink sequence initiated.\nSystem entry code: {code}`
6. **Power Horizon**: `🌌 [POWER HORIZON LINK]\nYour prosumer authentication code is: {code}\nCalibrating generation arrays now.`
7. **Titan Pulse**: `🔥 [TITAN PULSE DETECTED]\nHigh load authentication required.\nClearance key: {code}\nActive time: 600s.`
8. **Grid Automator**: `🤖 ECO-SYNC AUTOMATION:\nSmart routing node activation request.\nEnter passcode: {code}\nOptimize carbon output now.`

---

## 4. Authentication Endpoints Flow

### 1. `/api/auth/check-user`
*   Normalizes input. If it is a phone number, resolves the query email to the virtual shadow email format, and checks database presence.

### 2. `/api/auth/otp/send`
*   If the input is a phone number, clears old verification records and creates new `OtpVerification` records under the shadow email.
*   Selects a random SMS template, inserts the code, and dispatches it via Twilio SMS to the phone number.
*   If Twilio is not configured, logs details in the console and returns the mock OTP (dev sandbox fallback).

### 3. `/api/auth/otp/verify`
*   Verifies the token against the shadow email.
*   If the user does not exist, provisions a new `User` record with the shadow email, using the phone number as their default display name.

---

## 5. UI Updates

### 1. Settings Drawer (`src/components/SettingsDrawer.tsx`)
*   Provides phone number input and choice of notification channel (WhatsApp, SMS, or None).

### 2. Auth Modal & Auth Page (`src/components/AuthModal.tsx`, `src/components/AuthPage.tsx`)
*   Provides a toggle selector: "Email Address" vs. "Mobile Number".
*   Updates placeholders, input types, icons, and error handling.
