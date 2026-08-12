'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface AssignRouteData {
  id: string;
  created_at: string;
  teamid: string;
  routeid: string;
  start: boolean;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  check5: boolean;
}

export async function fetchTeamsData() {
  // Fetch teams (profiles with role='user')
  const { data: teams, error: teamsError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'user');

  if (teamsError) throw new Error('Failed to fetch teams');

  // Fetch routes
  const { data: routes, error: routesError } = await supabaseAdmin
    .from('routes')
    .select('*');

  if (routesError) throw new Error('Failed to fetch routes');

  // Fetch assignments
  const { data: assignments, error: assignError } = await supabaseAdmin
    .from('assignroute')
    .select('*');

  if (assignError) throw new Error('Failed to fetch assignments');

  return { teams: teams || [], routes: routes || [], assignments: assignments || [] };
}

export async function assignRouteToTeam(teamId: string, routeId: string) {
  // Check if assignment exists
  const { data: existing } = await supabaseAdmin
    .from('assignroute')
    .select('id')
    .eq('teamid', teamId)
    .maybeSingle();

  let error;
  
  if (existing) {
    // Update existing assignment
    const { error: updateError } = await supabaseAdmin
      .from('assignroute')
      .update({ routeid: routeId })
      .eq('id', existing.id);
    error = updateError;
  } else {
    // Create new assignment
    const { error: insertError } = await supabaseAdmin
      .from('assignroute')
      .insert([{ teamid: teamId, routeid: routeId }]);
    error = insertError;
  }

  if (error) {
    console.error('Error assigning route:', error);
    throw new Error('Failed to assign route');
  }

  revalidatePath('/admin/teams');
  return { success: true };
}

export async function unassignRouteFromTeam(teamId: string) {
  const { error } = await supabaseAdmin
    .from('assignroute')
    .delete()
    .eq('teamid', teamId);

  if (error) {
    console.error('Error unassigning route:', error);
    throw new Error('Failed to unassign route');
  }

  revalidatePath('/admin/teams');
  return { success: true };
}
