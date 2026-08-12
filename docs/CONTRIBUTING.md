# VDash - Developer Contributing Guide & Task Distribution

Welcome to the **VDash** developer team! This guide covers setup, Git workflows, and task assignments for our 3-person engineering team.

---

## 1. Local Development Setup

### Prerequisites
- Node.js (v18.x or later)
- npm or pnpm
- A Supabase project instance

### Setup Steps
1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run End-to-End Tests:**
   ```bash
   npm run test:e2e
   ```

---

## 2. Git & Commit Guidelines

To maintain a clean git history:

1. **One Logical Unit Per Commit**: Never mix unrelated work (e.g., UI tweaks + database changes) in a single commit.
2. **Conventional Commit Format**:
   - `feat(scope): add new feature`
   - `fix(scope): fix identified bug`
   - `style(scope): update component UI/theme`
   - `refactor(scope): restructure existing logic`
   - `test(scope): add end-to-end tests`
3. **Commit Size**: Keep commits small (1–5 files modified).
4. **Verification**: Always verify that the project builds (`npm run build`) and tests pass before committing.

---

## 3. 3-Contributor Task Assignment Matrix

To ensure clear ownership without merge conflicts, work is split among **3 Contributors**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                      VDASH TEAM                         │
 └────────────────────────────┬────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼─────────────────┐ ┌────▼─────────────────┐ ┌────▼─────────────────┐
│  CONTRIBUTOR 1       │ │  CONTRIBUTOR 2       │ │  CONTRIBUTOR 3       │
│  Backend, DB & Auth  │ │  Realtime UX & WebApp│ │  Mobile, PWA & E2E   │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

### 👤 Contributor 1: Backend, Security & Database Lead

**Focus Area:** Supabase schemas, server actions, authentication security, and server-side game logic.

- [ ] **Task 1.1: Server-Synced Countdown Timers**
  - Update `assignroute` schema to store `started_at` (Timestamp) and `completed_at` (Timestamp).
  - Update [app/teams/actions.ts](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/app/teams/actions.ts) to calculate remaining time on the server side instead of client clock.

- [ ] **Task 1.2: Database RLS Policies & Auth Security**
  - Implement Supabase Row Level Security (RLS) policies for `profiles`, `routes`, `checkpoints`, and `assignroute`.
  - Secure credential checks and password handling.

- [ ] **Task 1.3: Dynamic Checkpoint Engine**
  - Refactor fixed `ch1`..`ch5` columns in `routes` to dynamic array relationships.
  - Update server fetch helpers to handle variable route lengths smoothly.

---

### 👤 Contributor 2: Realtime UX, Admin & Scanner Lead

**Focus Area:** Live event monitoring, interactive web apps, in-app QR scanner, and organizer tools.

- [ ] **Task 2.1: Supabase Realtime Leaderboard**
  - Add Supabase Realtime WebSocket listeners to [components/admin/TeamManager.tsx](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/components/admin/TeamManager.tsx).
  - Automatically update team progress cards on `/admin/teams` without manual browser refresh.

- [ ] **Task 2.2: In-App Camera QR Code Scanner**
  - Create a new component `InAppQrScanner.tsx` using `html5-qrcode` or WebRTC camera APIs.
  - Mount scanner inside [components/modals/HexQrModal.tsx](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/components/modals/HexQrModal.tsx) for direct scanning.

- [ ] **Task 2.3: Admin Announcement & Broadcast Banner**
  - Create live broadcast banner component on team dashboards for organizer alerts.

---

### 👤 Contributor 3: Mobile UX, PWA & E2E Testing Lead

**Focus Area:** Mobile UI responsiveness, offline capabilities, client state, and automated test coverage.

- [ ] **Task 3.1: Progressive Web App (PWA) Integration**
  - Configure `next-pwa` or Web App Manifest (`manifest.json`) with app icons and dark theme colors.
  - Add service worker caching for static Game of Thrones assets and offline clue viewing.

- [ ] **Task 3.2: Mobile Touch UI & Animation Refinements**
  - Audit mobile dashboard layouts on iOS/Android viewports.
  - Enhance micro-animations in `TimerCard.tsx` and `FooterActions.tsx`.

- [ ] **Task 3.3: Playwright E2E Test Suite Expansion**
  - Expand [tests/auth.spec.ts](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/tests/auth.spec.ts) with full end-to-end game flow tests:
    1. Admin route creation & team assignment.
    2. Team login & tutorial completion.
    3. Checkpoint verification & game completion flow.
