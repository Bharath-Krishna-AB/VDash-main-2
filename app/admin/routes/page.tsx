import RouteManager from '@/components/admin/route/RouteManager';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function AdminRoutesPage() {
  const { data: checkpoints } = await supabaseAdmin.from('checkpoints').select('*').order('created_at', { ascending: false });
  const { data: routes } = await supabaseAdmin.from('routes').select('*').order('created_at', { ascending: false });

  return (
    <div className="h-full">
      <RouteManager initialCheckpoints={checkpoints || []} initialRoutes={routes || []} />
    </div>
  );
}
