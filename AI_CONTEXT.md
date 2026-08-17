# VDash - AI Agent Context & Instructions

This document provides a comprehensive overview of the VDash project to quickly orient AI agents working in this repository. **Always consult this file to understand the architecture, state management, and strict workflow rules before modifying code.**

## 1. Project Overview & Tech Stack

VDash is an interactive scavenger hunt and real-time team dashboard application.
- **Framework**: Next.js 16.2.10 (App Router)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Animations**: Framer Motion, GSAP
- **Language**: TypeScript

## 2. Core Architecture & Routing

The application is split into two primary domains, sharing authentication and backend services:

### Admin Portal (`/admin/*`)
A suite for organizers to manage the hunt. Key routes include:
- `/admin/teams`: Manage participating teams and assign routes.
- `/admin/routes`: Create and manage checkpoints and routes.
- `/admin/create-account`: Provision new accounts.

### Team Portal (`/teams/[teamName]/*`)
An interactive, mobile-first dashboard for participants. Key routes include:
- `/teams/[teamName]`: The primary dashboard (timer, score, next checkpoint).
- `/teams/[teamName]/hint`: Dedicated modal/page for viewing hints.
- `/teams/[teamName]/qr/[checkpointId]`: Landing page when scanning a physical QR code at a checkpoint.
- **Alias Route**: `/[teamName]/qr/[checkpointId]` maps to the team's QR landing page for shorter QR code URLs.

## 3. Data Models

The core data structures are defined in `types/index.ts`. When interacting with Supabase or component state, use these shapes:

```typescript
export interface Checkpoint {
  id: number;
  title: string;
  duration: number;
  code: string;
  hint: string;
  qrText?: string;
}

export interface RouteData {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
}

export interface TeamData {
  name: string;
  contactNumber?: string;
  routeId?: string;
  checkpoints?: Checkpoint[]; // Populated from Route
  timerDuration: number;
  permittedCodes: string[];
  currentLevel: string;
  currentHint: string;
}
```

## 4. State Management & Key Components

- **`GameContext`** (`components/teams/GameContext.tsx`): The global state provider for a team's active session. It manages the countdown timer logic, tracks `timeStarted`, `isCompleted`, and handles checkpoint progression.
- **Layout Shell**: `Header` and `FooterActions` wrap the team dashboard. `FooterActions` acts as a bottom navigation bar triggering modals (Hint, Verify, Contact). These are conditionally hidden on immersive routes like QR scans.
- **Modals**: Modal states (like Verification or Help Desk) are managed via URL query parameters (e.g., `?modal=verify`) and rendered through `ModalsContainer`.

## 5. Database & Supabase Integration

- **Auth**: Users authenticate via `/login`. Wait, is it standard users or custom team credentials? The project creates team and admin accounts explicitly.
- **Environment**: Ensure `.env.local` is present with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- **Warning**: Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It bypasses RLS and should only be used in secure server actions/APIs for admin operations.

## 6. Design & Styling Philosophy

- **Theme**: "Game of Thrones" inspired dark-theme. Utilizes deep blacks, dark slate grays (`zinc`), and sharp silver/white highlights.
- **Constraints**: **Strictly avoid warm colors and distracting gradients.** The design must remain a high-contrast, premium monochromatic experience with atmospheric background imagery.
- **Animations**: Use `framer-motion` and `gsap` for micro-interactions and smooth transitions to make the UI feel alive.

---

## 7. CRITICAL: Workflow & Git Rules (`GEMINI.md`)

When executing user requests, you **MUST** strictly adhere to the following workflow rules defined in `GEMINI.md`:

### Human Approval Gate (MANDATORY)
**Git commits require explicit human approval.** You must NEVER create a commit automatically.
1. Finish the implementation of ONE logical unit.
2. Verify code builds and tests pass.
3. Present a summary of changes and suggested commit message to the user.
4. **STOP and wait for the user to explicitly reply with `approved`, `commit`, or `looks good`.**
5. Only create the Git commit after receiving this approval.

### Task Decomposition & Commits
- Break requests into the smallest independent logical units (e.g., Schema -> API -> Component).
- **One responsibility only per commit.** Do not mix unrelated work.
- Use Conventional Commits (e.g., `feat(auth): create login endpoint`).
- Commits should be small (1-5 files). If it's larger, split the feature further.
- Never push, merge, rebase, or force push unless explicitly asked.
- Verify compilation, linting, and unused imports before asking for commit approval.

**Failure to follow the workflow and design constraints is UNACCEPTABLE.**
