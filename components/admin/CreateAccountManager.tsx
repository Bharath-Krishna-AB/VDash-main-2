import React from 'react';
import ActiveAccountsList from '@/components/admin/ActiveAccountsList';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function CreateAccountManager() {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-col gap-6 lg:gap-8 min-h-0 flex-1 w-full max-w-5xl mx-auto">
        <ActiveAccountsList initialProfiles={profiles || []} />
      </div>
    </div>
  );
}
