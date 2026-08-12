# VDash - Interactive Scavenger Hunt & Team Dashboard

VDash is a highly interactive, full-stack team dashboard and real-world scavenger hunt application. Built with modern web technologies, it features a comprehensive administration panel for event organizers and an immersive, real-time tracking dashboard for participating teams.

The application features a sleek, "Game of Thrones" inspired dark-theme UI with micro-animations, providing a premium experience for users scanning QR codes at physical locations and tracking their route progress.

## Tech Stack
- **Framework**: Next.js 16.2.10 (App Router)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL, Authentication)
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React / SVG Icons
- **Language**: TypeScript

## Project Structure & Architecture

The application is structured into two main domains: **Admin** and **Teams**.

### 1. Admin Portal (`/admin/*`)
A dedicated suite for organizers to manage the hunt.
- **`/admin`**: The main admin dashboard overview.
- **`/admin/teams`**: Manage participating teams, view their progress, and assign routes.
- **`/admin/routes`**: Create and configure different routes and checkpoints.
- **`/admin/create-account`**: Provision new user/team accounts securely.
- **`/admin/qr-design`**: Generate and customize QR codes for physical checkpoints.

### 2. Team Portal (`/teams/[teamName]/*`)
The interactive mobile-first dashboard for participants.
- **`/teams/[teamName]`**: The primary dashboard showing the team's route, current checkpoint, score, and interactive timer.
- **`/teams/[teamName]/hint`**: A dedicated page/modal for viewing hints for the current checkpoint.
- **`/teams/[teamName]/qr/[checkpointId]`**: The landing page when a team scans a physical QR code at a location. It features a stark, full-screen Game of Thrones aesthetic, notifying them of the points claimed and providing the next clue.

### 3. Shared Routes
- **`/login`**: Authentication gateway for both admins and teams.
- **`/[teamName]/qr/[checkpointId]`**: A shortened URL alias for the QR scan landing page (synced with the `/teams` path for convenience).

## Environment Variables (.env.local)

The application relies on Supabase for backend services. The following keys must be present in your `.env.local` file at the root of the project.

> [!WARNING]
> Keep your `.env.local` file out of version control. The Service Role Key bypasses Row Level Security (RLS) and must never be exposed to the client.

```env
# The URL of your Supabase project instance
NEXT_PUBLIC_SUPABASE_URL=https://qgsocncgxheedyvzypjk.supabase.co

# The public publishable key for client-side Supabase initialization
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZwskZrbY0cNjWEZBDA30ig_k8G03qy8

# The public anon key for standard authenticated client-side requests
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (truncated for security)

# The private service role key. DO NOT EXPOSE TO CLIENTS.
# Used in server actions and API routes to bypass RLS for admin operations.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (truncated for security)
```

## Key Components & State Management

- **`GameContext` (`components/teams/GameContext.tsx`)**: The global state provider for a team's active session. It tracks `timeStarted`, `isCompleted`, the current checkpoint index, and manages the real-time countdown timer logic.
- **`Header & FooterActions`**: Persistent layout components for the team dashboard. `FooterActions` serves as a floating bottom navigation bar offering quick access to Hint, Verify, Contact, QR, and Logout modals. These components automatically hide themselves on distraction-free pages like the QR scan landing page.
- **`ModalsContainer`**: A centralized portal that handles the rendering of various application modals (Verification, Contact Help Desk, etc.) via URL query parameters (`?modal=verify`).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   Create a `.env.local` file and populate it with the Supabase keys detailed above.
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Philosophy
The UI prioritizes a premium, cinematic experience. It utilizes deep blacks, dark slate grays (`zinc`), and sharp silver/white highlights to achieve a sophisticated, monochromatic look. Distracting gradients and warm colors are strictly avoided in favor of high-contrast readability and atmospheric background imagery.
