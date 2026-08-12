'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { CheckpointData } from '@/components/admin/CheckpointItem';

export async function addCheckpoint(data: Omit<CheckpointData, 'id' | 'created_at' | 'index'>) {
  const { data: insertedData, error } = await supabaseAdmin
    .from('checkpoints')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error adding checkpoint:', error);
    throw new Error('Failed to add checkpoint.');
  }

  revalidatePath('/admin/routes');
  return insertedData;
}

export async function updateCheckpoint(id: string, data: Partial<CheckpointData>) {
  const { error } = await supabaseAdmin
    .from('checkpoints')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating checkpoint:', error);
    throw new Error('Failed to update checkpoint.');
  }

  revalidatePath('/admin/routes');
  return { success: true };
}

export async function deleteCheckpoint(id: string) {
  const { error } = await supabaseAdmin
    .from('checkpoints')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting checkpoint:', error);
    throw new Error('Failed to delete checkpoint.');
  }

  revalidatePath('/admin/routes');
  return { success: true };
}

// --- ROUTES ACTIONS ---

export interface DBRouteData {
  id?: string;
  title: string;
  ch1: string | null;
  ch2: string | null;
  ch3: string | null;
  ch4: string | null;
  ch5: string | null;
  duration1: number;
  duration2: number;
  duration3: number;
  duration4: number;
  duration5: number;
}

export async function addRoute(data: DBRouteData) {
  const { data: insertedData, error } = await supabaseAdmin
    .from('routes')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error adding route:', error);
    throw new Error('Failed to add route.');
  }

  revalidatePath('/admin/routes');
  return insertedData;
}

export async function updateRoute(id: string, data: Partial<DBRouteData>) {
  const { error } = await supabaseAdmin
    .from('routes')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating route:', error);
    throw new Error('Failed to update route.');
  }

  revalidatePath('/admin/routes');
  return { success: true };
}

export async function deleteRoute(id: string) {
  const { error } = await supabaseAdmin
    .from('routes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting route:', error);
    throw new Error('Failed to delete route.');
  }

  revalidatePath('/admin/routes');
  return { success: true };
}
