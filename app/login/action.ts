// app/login/actions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(username: string, password: string) {
  const cleanInput = username.replace(/\s+/g, '').toLowerCase();

  // Fetch profiles matching the password to find the correct username case/spacing
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role, password')
    .eq('password', password);

  const profile = profiles?.find(p => p.username.replace(/\s+/g, '').toLowerCase() === cleanInput);

  if (!profile) redirect('/login?error=invalid');

  const actualUsername = profile.username;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate with global account (dummy auth)
  const { error } = await supabase.auth.signInWithPassword({
    email: '2007bharathab@gmail.com',
    password: 'coding0224',
  });

  if (error) redirect('/login?error=invalid');

  // Save the actual profile role, id, and actual username to cookies for the proxy
  cookieStore.set('user_role', profile.role, { path: '/' });
  cookieStore.set('user_id', profile.id, { path: '/' });
  cookieStore.set('user_name', actualUsername, { path: '/' });

  if (profile.role === 'admin') redirect('/admin');

  // Check if the team has already started the game (timer running)
  const { data: assignment } = await supabaseAdmin
    .from('assignroute')
    .select('start')
    .eq('teamid', profile.id)
    .single();

  const hasStarted = assignment?.start === true;
  const tutorialCookie = cookieStore.get(`tutorial_seen_${actualUsername}`);
  
  // Only show tutorial if it's their first time AND the timer hasn't started yet
  if (!tutorialCookie && !hasStarted) {
    // Set cookie so it never shows again for this user on this browser
    cookieStore.set(`tutorial_seen_${actualUsername}`, 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 * 10 }); // 10 years
    redirect(`/teams/${actualUsername}?tutorial=true`);
  }

  redirect(`/teams/${actualUsername}`);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_role');
  cookieStore.delete('user_id');
  cookieStore.delete('user_name');

  const supabase = createClient(cookieStore);
  await supabase.auth.signOut({ scope: 'local' });

  redirect('/login');
}