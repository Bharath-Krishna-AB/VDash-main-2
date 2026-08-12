import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
  const { data: teams } = await supabase.from('teams').select('*').limit(1);
  const { data: routes } = await supabase.from('routes').select('*').limit(1);
  const { data: assignroute } = await supabase.from('assignroute').select('*').limit(1);
  console.log("TEAMS:", JSON.stringify(teams, null, 2));
  console.log("ROUTES:", JSON.stringify(routes, null, 2));
  console.log("ASSIGNROUTE:", JSON.stringify(assignroute, null, 2));
}
run();
