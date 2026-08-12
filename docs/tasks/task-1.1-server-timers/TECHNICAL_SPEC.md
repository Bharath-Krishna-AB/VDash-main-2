# Task 1.1: Server-Synced Countdown Timers — Technical Specification

## 1. Problem Statement

VDash previously tracked scavenger hunt countdown timers using client-side browser logic (`Date.now()` and `localStorage`). 

### Key Issues Resolved:
1. **Clock Manipulation Risk**: Participating teams could manually roll back their phone's system time to get extra minutes on a checkpoint.
2. **Device State Loss**: If a team member switched devices or cleared browser data (`localStorage`), timer state was lost or reset.
3. **Lack of Admin Auditability**: Server logs and Supabase database tables did not record exact timestamps of when a team started or completed each checkpoint.

---

## 2. Technical Architecture & Database Schema

### Database Migration (Supabase SQL)

Added timestamp columns to `assignroute`:

```sql
ALTER TABLE assignroute 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checkpoint_started_at TIMESTAMPTZ DEFAULT NULL;
```

---

## 3. Server Actions Layer ([app/teams/actions.ts](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/app/teams/actions.ts))

Updated server actions to record server timestamps upon game start and checkpoint progress:

```typescript
export async function updateGameStart(assignmentId: number) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('assignroute')
    .update({ 
      start: true,
      started_at: now,
      checkpoint_started_at: now
    })
    .eq('id', assignmentId);

  return !error;
}

export async function updateCheckpointStatus(assignmentId: number, checkIndex: number, isFinal: boolean = false) {
  const column = `check${checkIndex}`;
  const now = new Date().toISOString();
  const updateObj: Record<string, any> = {
    [column]: true,
    checkpoint_started_at: now
  };

  if (isFinal) {
    updateObj.completed_at = now;
  }

  const { error } = await supabaseAdmin
    .from('assignroute')
    .update(updateObj)
    .eq('id', assignmentId);

  return !error;
}
```

---

## 4. Client State & Device Time Drift Compensation ([components/teams/GameContext.tsx](file:///e:/CCE/Projects/IEDC-VDASH/sample/VDash/components/teams/GameContext.tsx))

1. Removed `localStorage` key readers/writers (`game_state_${teamName}`).
2. Initialized `timeStarted` directly from `data.assignment.checkpoint_started_at` returned by `fetchTeamGameState()`.
3. Computed device drift offset:
   ```typescript
   const serverTimeDelta = serverNow - Date.now();
   timeStarted = serverStart - serverTimeDelta;
   ```
