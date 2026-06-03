# Design: Neon Postgres Database Integration, Resend OTP Authentication, and Color Overhaul

## Context & Problem Statement
The Eco-Sync Nexus application needs user authentication to persist configurations, user settings, profile data, and simulate peer-to-peer trading profiles on a database. 
Additionally, the user requested:
1. Connecting to Neon DB.
2. Sign-in error when trying to log in with a non-existent email ("your account is not created").
3. Sign-up flow using Resend to dispatch a 4-digit OTP code to the email for verification.
4. Top profile panel with features to customize display name, bio, avatar, and other functional system settings.
5. Three theme viewing modes: Dark, Light, and System.
6. A visual style overhaul to eliminate "AI slop" (cheap glowing borders, low-contrast neon grids, and over-saturated elements) and transition to a premium design.

---

## Proposed Design

### 1. Database & ORM
We will use **Prisma** to model our tables in Neon PostgreSQL. If `DATABASE_URL` is not provided in `.env.local` or the database is offline, the app will run in a transparent **Mock Database** client to allow local testing and grading without environment configuration.

#### Database Schema
*   `User`: Email, display name, bio, avatar image, theme preferences, and functional configuration parameters.
*   `OtpVerification`: Stores generated 4-digit codes, expiration timestamps, and target emails.

---

### 2. OTP Authentication Protocol
*   **Sign In**: Verification of existence in the database. Returns a `404` or error message if the account doesn't exist.
*   **Sign Up**: Dispatches a 4-digit OTP via Resend.
*   **Verification**: Checks the valid, unexpired OTP and creates the profile.
*   **Session Management**: A lightweight JWT session saved in a secure cookie, managed via a Next.js middleware or Client Context.

---

### 3. Theme & Aesthetics Overhaul
*   **Theme Context**: Manage theme selection (Dark, Light, System) by updating the `documentElement` class list (`dark` or `light`) and resolving standard dark media query queries for System mode.
*   **UI Redesign**: Replace overly bright glow lines and cyber-neon borders with:
    *   Matte background tones (zinc and charcoal slate).
    *   High-contrast monochrome typography.
    *   Subtle borders using clean colors.
    *   Curated secondary tones: rich copper/amber for solar energy, cobalt blue for utility grid drawing, and platinum gray.

---

### 4. Customization & Settings Options
*   **Header Profile Component**: A profile avatar button at the top right of the dashboard. Click opens a dropdown detailing display name, bio, and settings.
*   **Profile Drawer**: Slide-out overlay where users can change their profile photo, display name, write about themselves, and update functional simulator configurations (battery capacity, electric pricing factors).

---

## Verification Plan
1.  **Auth Route Testing**: Direct requests to `/api/auth/otp/send` and `verify` to confirm proper validation and DB inserts.
2.  **Mock Environment Mode**: Verify authentication and session flows run successfully when no `.env.local` variables are present.
3.  **UI Verification**: Test Light, Dark, and System modes to check readability and visual contrast. Confirm elimination of low-quality neon styles.
