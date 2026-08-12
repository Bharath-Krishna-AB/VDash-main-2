'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';

export async function fetchTeamGameState(teamName: string) {
  // 1. Get the team profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username')
    .eq('username', teamName)
    .single();

  if (!profile) return null;

  // 2. Get the assigned route
  const { data: assignment } = await supabaseAdmin
    .from('assignroute')
    .select('*')
    .eq('teamid', profile.id)
    .single();

  if (!assignment) return null;

  // 3. Get the route details
  const { data: route } = await supabaseAdmin
    .from('routes')
    .select('*')
    .eq('id', assignment.routeid)
    .single();

  if (!route) return null;

  // 4. Get all checkpoints for this route
  const checkpointIds = [route.ch1, route.ch2, route.ch3, route.ch4, route.ch5].filter(Boolean);
  
  const { data: checkpoints } = await supabaseAdmin
    .from('checkpoints')
    .select('*')
    .in('id', checkpointIds);

  if (!checkpoints) return null;

  // Ensure checkpoints are ordered correctly as defined in the route
  const orderedCheckpoints = [
    route.ch1, route.ch2, route.ch3, route.ch4, route.ch5
  ].map((id, idx) => {
    const cp = checkpoints.find(c => c.id === id);
    if (!cp) return null;
    return {
      id: cp.id,
      title: cp.title,
      verifyCode: cp.verification,
      targetLocation: cp.qrhint, // Using qrhint as location/hint for now
      hint: cp.apphint,
      durationSeconds: route[`duration${idx + 1}` as keyof typeof route] as number
    };
  }).filter(Boolean);

  return {
    team: profile,
    assignment,
    route,
    checkpoints: orderedCheckpoints,
    serverNow: new Date().toISOString()
  };
}

export async function updateGameStart(assignmentId: number) {
  const now = new Date().toISOString();
  // The first QR screen shows for 10s before the timer starts
  const timerStart = new Date(Date.now() + 10000).toISOString();
  
  const { error } = await supabaseAdmin
    .from('assignroute')
    .update({ 
      start: true,
      started_at: now,
      checkpoint_started_at: timerStart
    })
    .eq('id', assignmentId);

  if (error) {
    console.error('Failed to start game:', error);
    return false;
  }
  return true;
}

export async function updateCheckpointStatus(assignmentId: number, checkIndex: number, isFinal: boolean = false, bonusTimeMs: number = 0) {
  const column = `check${checkIndex}`;
  const now = new Date().toISOString();
  // The timer actually starts after the 10s QR display + any bonus time carried over.
  // Pushing checkpoint_started_at forward by bonusTimeMs means on reload, the elapsed time
  // will effectively be reduced by bonusTimeMs, granting them the extra time.
  const timerStart = new Date(Date.now() + bonusTimeMs + 10000).toISOString();
  
  const updateObj: Record<string, any> = {
    [column]: true,
    checkpoint_started_at: timerStart
  };

  if (isFinal) {
    updateObj.completed_at = now;
  }

  const { error } = await supabaseAdmin
    .from('assignroute')
    .update(updateObj)
    .eq('id', assignmentId);

  if (error) {
    console.error(`Failed to update check${checkIndex}:`, error);
    return false;
  }
  return true;
}

export async function resetTeamRoute(assignmentId: number) {
  const { error } = await supabaseAdmin
    .from('assignroute')
    .update({ 
      start: false,
      check1: false,
      check2: false,
      check3: false,
      check4: false,
      check5: false,
      started_at: null,
      completed_at: null,
      checkpoint_started_at: null
    })
    .eq('id', assignmentId);

  if (error) {
    console.error('Failed to reset team route:', error);
    return false;
  }
  return true;
}