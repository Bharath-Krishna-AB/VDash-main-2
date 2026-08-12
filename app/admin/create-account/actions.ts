'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// Helper to verify the caller is an admin
async function requireAdmin() {
  const cookieStore = await cookies();
  const cookieUsername = cookieStore.get("user_name")?.value;
  if (!cookieUsername) throw new Error('unauthorized');
  
  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('username', cookieUsername)
    .single();

  if (callerProfile?.role !== 'admin') {
    throw new Error('forbidden: only admins can manage accounts');
  }
}

export async function createAccountAction(payload: any) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const { username, password, phonenumber, role } = payload;
  
  if (!/^\d+$/.test(password)) {
    return { error: 'password must contain only numbers' };
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    username,
    password: parseInt(password, 10),
    phonenumber: phonenumber ? parseInt(phonenumber.replace(/\D/g, ''), 10) : null,
    role,
  });
  
  if (profileError) {
    if (profileError.code === '23505') {
      return { error: 'username or team name already exists' };
    }
    return { error: profileError.message };
  }

  revalidatePath('/admin/create-account');
  return { success: true };
}

export async function updateAccountAction(id: string, payload: any) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  const { username, password, phonenumber } = payload;
  
  const updateData: any = {};
  if (username !== undefined) updateData.username = username;
  if (password !== undefined) {
    if (!/^\d+$/.test(password)) return { error: 'password must contain only numbers' };
    updateData.password = parseInt(password, 10);
  }
  if (phonenumber !== undefined) {
    updateData.phonenumber = phonenumber ? parseInt(phonenumber.replace(/\D/g, ''), 10) : null;
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', id);

  if (profileError) {
    if (profileError.code === '23505') return { error: 'username or team name already exists' };
    return { error: profileError.message };
  }

  revalidatePath('/admin/create-account');
  return { success: true };
}

export async function deleteAccountAction(id: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }
  // Delete associated route assignments first to satisfy foreign key constraint
  const { error: assignError } = await supabaseAdmin.from('assignroute').delete().eq('teamid', id);
  if (assignError) return { error: assignError.message };

  const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/create-account');
  return { success: true };
}

export async function bulkCreateAccountsAction(rows: { username: string; password: string; role?: string; phonenumber?: string }[]) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message };
  }

  if (!rows || rows.length === 0) {
    return { error: 'No rows provided' };
  }

  const results: { username: string; status: 'created' | 'skipped' | 'error'; reason?: string }[] = [];
  const validRowsToInsert: any[] = [];
  const seenUsernames = new Set<string>();

  // Fetch existing usernames to avoid DB duplicate errors for the whole batch
  const { data: existingProfiles } = await supabaseAdmin.from('profiles').select('username');
  const existingUsernames = new Set(existingProfiles?.map(p => p.username) || []);

  for (const row of rows) {
    const { username, password, role, phonenumber } = row;

    if (!username || username.trim() === '') {
      results.push({ username: username || '(empty)', status: 'error', reason: 'empty username' });
      continue;
    }

    if (!password || !/^\d+$/.test(password)) {
      results.push({ username, status: 'error', reason: 'password must contain only numbers' });
      continue;
    }

    if (seenUsernames.has(username)) {
      results.push({ username, status: 'skipped', reason: 'duplicate in batch' });
      continue;
    }

    if (existingUsernames.has(username)) {
      results.push({ username, status: 'skipped', reason: 'already exists' });
      continue;
    }

    seenUsernames.add(username);
    validRowsToInsert.push({
      username,
      password: parseInt(password, 10),
      role: role && ['admin', 'user'].includes(role.toLowerCase()) ? role.toLowerCase() : 'user',
      phonenumber: phonenumber ? parseInt(phonenumber.replace(/\D/g, ''), 10) : null,
    });
  }

  if (validRowsToInsert.length > 0) {
    const { error: profileError } = await supabaseAdmin.from('profiles').insert(validRowsToInsert);
    
    if (profileError) {
      // If there's a bulk insert error, mark all valid ones as error
      for (const row of validRowsToInsert) {
        results.push({ username: row.username, status: 'error', reason: profileError.message });
      }
    } else {
      for (const row of validRowsToInsert) {
        results.push({ username: row.username, status: 'created' });
      }
      revalidatePath('/admin/create-account');
    }
  }

  return { results };
}
