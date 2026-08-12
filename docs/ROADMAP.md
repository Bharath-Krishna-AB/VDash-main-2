# VDash - Product Roadmap & Feature Backlog

This document outlines the development roadmap to transition VDash from its initial MVP state into a battle-tested, production-ready platform capable of running large-scale event scavenger hunts.

---

## Milestone 1: Core System Hardening & Security

- [ ] **1.1 Server-Validated Timers**: Replace client-side interval timer logic in `GameContext` with server-side start (`started_at`) and completion (`completed_at`) timestamps to prevent clock manipulation.
- [ ] **1.2 Supabase Row Level Security (RLS)**: Enforce RLS policies so team accounts can only read their own assigned route and update their own progress.
- [ ] **1.3 Input Sanitization & Password Hashing**: Hash team passwords/PINs using bcrypt/Argon2 rather than storing plain strings.

---

## Milestone 2: Live Event & Realtime Features

- [ ] **2.1 Supabase Realtime Leaderboard**: Implement live WebSocket subscriptions on `/admin/teams` so event organizers can view live checkpoint completions without refreshing.
- [ ] **2.2 In-App Camera QR Code Scanner**: Add an integrated HTML5/WebRTC camera scanner modal inside `/teams/[teamName]` so participants can scan physical QR codes directly inside the browser.
- [ ] **2.3 Broadcast Notifications**: Enable admins to push live announcements or time penalty alerts to all active team dashboards.

---

## Milestone 3: Dynamic Route & Game Engine

- [ ] **3.1 Variable Checkpoint Count**: Refactor the database schema and team state from a fixed 5-checkpoint structure (`ch1`..`ch5`) to an arbitrary list of checkpoints per route (`checkpoints: Checkpoint[]`).
- [ ] **3.2 Multi-Branching Routes**: Allow checkpoint unlocking based on optional paths or conditional puzzle solving.
- [ ] **3.3 Penalty & Bonus Mechanics**: Deduct or award time based on hint requests or optional bonus checkpoints.

---

## Milestone 4: Offline Resilience & Mobile PWA

- [ ] **4.1 Progressive Web App (PWA) Manifest**: Add service worker caching for static assets, styles, and active checkpoint clues.
- [ ] **4.2 Offline Verification Queue**: Store checkpoint verification attempts in IndexedDB when offline and automatically sync with Supabase when cellular connection is restored.
- [ ] **4.3 Low-Bandwidth Optimizations**: Optimize background images and asset sizes for fast loading in crowded event environments.

---

## Milestone 5: Analytics & Post-Event Reporting

- [ ] **5.1 Organizer Analytics Dashboard**: Graphs showing average completion time per checkpoint, difficulty bottlenecks, and team speed trends.
- [ ] **5.2 Exportable Leaderboard Data**: One-click CSV and PDF export of final rankings, completion timestamps, and score logs.
- [ ] **5.3 Automated Certificate Generator**: Generate personalized digital completion certificates for participating teams.
