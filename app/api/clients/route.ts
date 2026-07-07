import { NextResponse } from 'next/server';
import { fallbackUsers, getSupabaseClient } from '@/lib/server/shared';
export async function GET() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from('users').select('*').eq('app_role', 'Client').eq('status', 'ACTIVE');
    if (data) return NextResponse.json(data.map((u: any) => ({ id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, appRole: u.app_role, companyName: u.company_name, clientId: u.client_id, status: u.status })));
  }
  return NextResponse.json(fallbackUsers.filter(u => u.appRole === 'Client' && u.status === 'ACTIVE'));
}