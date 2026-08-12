// app/login/actions.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(username: string, password: string) {
  // Resolve username to profile using admin client
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, password')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (!profile) redirect('/login?error=invalid');

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate with global account (dummy auth)
  const { error } = await supabase.auth.signInWithPassword({
    email: '2007bharathab@gmail.com',
    password: 'coding0224',
  });

  if (error) redirect('/login?error=invalid');

  // Save the actual profile role, id, and username to cookies for the proxy
  cookieStore.set('user_role', profile.role, { path: '/' });
  cookieStore.set('user_id', profile.id, { path: '/' });
  cookieStore.set('user_name', username, { path: '/' });

  if (profile.role === 'admin') redirect('/admin');

  // Check if the team has already started the game (timer running)
  const { data: assignment } = await supabaseAdmin
    .from('assignroute')
    .select('start')
    .eq('teamid', profile.id)
    .single();

  const hasStarted = assignment?.start === true;
  const tutorialCookie = cookieStore.get(`tutorial_seen_${username}`);
  
  // Only show tutorial if it's their first time AND the timer hasn't started yet
  if (!tutorialCookie && !hasStarted) {
    // Set cookie so it never shows again for this user on this browser
    cookieStore.set(`tutorial_seen_${username}`, 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 * 10 }); // 10 years
    redirect(`/teams/${username}?tutorial=true`);
  }

  redirect(`/teams/${username}`);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_role');
  cookieStore.delete('user_id');
  cookieStore.delete('user_name');

  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();

  redirect('/login');
}