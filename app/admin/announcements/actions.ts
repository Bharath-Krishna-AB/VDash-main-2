'use server';

import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function broadcastAnnouncement(message: string, routeId: string | null = null) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;

  if (role !== 'admin') {
    throw new Error('Unauthorized: Only admins can broadcast announcements.');
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error('Validation Error: Message cannot be empty.');
  }
  
  if (trimmedMessage.length > 2000) {
    throw new Error('Validation Error: Message is too long (max 2000 characters).');
  }

  const { error } = await supabaseAdmin
    .from('announcements')
    .insert([{ message: trimmedMessage, route_id: routeId }]);

  if (error) {
    console.error('Error inserting announcement:', error);
    throw new Error('Failed to broadcast announcement.');
  }
  
  return { success: true };
}

export async function getAvailableRoutes() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;

  if (role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabaseAdmin
    .from('routes')
    .select('id, title')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
  return data;
}
