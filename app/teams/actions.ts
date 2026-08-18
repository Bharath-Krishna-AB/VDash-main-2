'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';

import { unstable_cache } from 'next/cache';

const getCachedRoutes = unstable_cache(
  async () => {
    const { data: routes } = await supabaseAdmin.from('routes').select('*');
    return routes || [];
  },
  ['all-routes'],
  { tags: ['routes'] }
);

const getCachedCheckpoints = unstable_cache(
  async () => {
    const { data: checkpoints } = await supabaseAdmin.from('checkpoints').select('*');
    return checkpoints || [];
  },
  ['all-checkpoints'],
  { tags: ['checkpoints'] }
);

export async function fetchTeamGameState(teamName: string) {
  // 1 & 2. Get the team profile and their assigned route in one query
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      username,
      assignroute (*)
    `)
    .eq('username', teamName)
    .single();

  if (!profileData) return null;

  const profile = { id: profileData.id, username: profileData.username };
  const assignment = Array.isArray(profileData.assignroute) 
    ? profileData.assignroute[0] 
    : profileData.assignroute;

  if (!assignment) return null;

  // 3. Get the route details from cache
  const allRoutes = await getCachedRoutes();
  const route = allRoutes.find(r => r.id === assignment.routeid);

  if (!route) return null;

  // 4. Get checkpoints from cache
  const allCheckpoints = await getCachedCheckpoints();

  // Ensure checkpoints are ordered correctly as defined in the route
  const orderedCheckpoints = [
    route.ch1, route.ch2, route.ch3, route.ch4, route.ch5
  ].map((id, idx) => {
    const cp = allCheckpoints.find(c => c.id === id);
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