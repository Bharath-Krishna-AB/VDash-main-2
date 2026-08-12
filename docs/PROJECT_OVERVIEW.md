# VDash - Project Architecture & Technical Overview

## 1. Executive Summary

**VDash** is a full-stack, real-time team dashboard and physical scavenger hunt application. Built for high-energy events like campus competitions, hackathons, and tech fests, VDash bridges the physical and digital worlds:
- **Organizers** use an Admin Suite to configure routes, manage checkpoints, create team credentials, generate QR codes, and track live progress.
- **Participating Teams** use a mobile-first, dark-themed dashboard to solve clues, navigate campus checkpoints, scan physical QR codes, and verify locations under an active countdown timer.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | Next.js 16 (App Router) | Server-side rendering, API routes, and Server Actions |
| **Language** | TypeScript | Type safety across database schemas, server actions, and UI components |
| **Styling & Theme** | Tailwind CSS v4 | Dark-mode, high-contrast Game of Thrones cinematic styling |
| **Database & Auth** | Supabase (PostgreSQL) | Data persistence, role lookup, and backend API interactions |
| **Animations** | Framer Motion & GSAP | Smooth page transitions, modal reveals, and timer animations |
| **Testing** | Playwright | End-to-end testing for authentication, routing, and user flows |

---

## 3. System Architecture & Routing

### A. Routing Map

```
/
├── login                       -> Shared authentication gateway
├── admin/                      -> Protected Admin Suite (role: 'admin')
│   ├── teams                   -> Team progress tracking & route assignment
│   ├── routes                  -> Checkpoint & route manager
│   ├── create-account          -> Team account provisioning
│   └── qr-design               -> QR code designer & generator
├── teams/[teamName]/           -> Protected Team Dashboard (role: 'user')
│   ├── hint                    -> Active clue viewing
│   └── qr/[checkpointId]       -> QR scan landing page (territory claimed)
└── [teamName]/qr/[checkpointId]-> Shortened URL alias for physical QR code scans
```

### B. Authentication & Proxy Middleware ([proxy.ts](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/proxy.ts))

Access control is enforced via Next.js Middleware in `proxy.ts`:
1. Users authenticate at `/login` via the `login()` Server Action in [app/login/action.ts](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/app/login/action.ts).
2. Upon successful authentication, cookies are set: `user_role`, `user_id`, and `user_name`.
3. Middleware inspects `user_role` on incoming requests:
   - `admin` users accessing non-admin routes are redirected to `/admin`.
   - `user` teams attempting to access `/admin` routes receive an unauthorized error and are routed back to `/teams/[teamName]`.

---

## 4. Database Schema (Supabase)

VDash interacts with Supabase using 4 core tables:

### 1. `profiles`
Stores user credentials and roles.
- `id` (UUID, Primary Key)
- `username` (Text, Unique)
- `password` (Text, PIN/Password)
- `role` (Text: `'admin'` or `'user'`)

### 2. `checkpoints`
Defines physical locations and clues.
- `id` (BigInt / Text, Primary Key)
- `title` (Text) — e.g., "The Old Library Citadel"
- `apphint` (Text) — Primary clue displayed in the dashboard
- `qrhint` (Text) — Secondary clue revealed upon scanning the location QR code
- `verification` (Text) — Secret passcode entered by the team to verify arrival
- `points` (Integer) — Reward points gained upon completion

### 3. `routes`
Presets sequences of checkpoints for teams.
- `id` (UUID, Primary Key)
- `title` (Text) — e.g., "North Castle Route"
- `ch1`, `ch2`, `ch3`, `ch4`, `ch5` (Text) — References to checkpoint IDs in sequence
- `duration1`, `duration2`, `duration3`, `duration4`, `duration5` (Integer) — Target time limits in seconds per checkpoint

### 4. `assignroute`
Tracks active team assignments and real-time completion state.
- `id` (BigInt, Primary Key)
- `teamid` (UUID, Foreign Key -> `profiles.id`)
- `routeid` (UUID, Foreign Key -> `routes.id`)
- `start` (Boolean) — Indicates whether the team has officially started the game
- `check1`, `check2`, `check3`, `check4`, `check5` (Boolean) — Real-time completion status flags per checkpoint

---

## 5. Key Frontend Components & State

- **`GameContext` ([components/teams/GameContext.tsx](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/components/teams/GameContext.tsx))**: Global state provider for team sessions. Manages active countdown timers, current checkpoint index, and status flags.
- **`ModalsContainer` ([components/modals/ModalsContainer.tsx](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/components/modals/ModalsContainer.tsx))**: Centralized portal rendering verification, hint, help/contact, and QR modals driven by URL query parameters (`?modal=verify`).
- **`FooterActions`**: Floating mobile navigation bar offering quick access to Hint, Verification, Help Desk, and Logout modals. Automatically hides on full-screen landing pages.
