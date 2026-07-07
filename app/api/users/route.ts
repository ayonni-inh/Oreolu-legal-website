import { NextRequest, NextResponse } from 'next/server';
import { fallbackUsers, getSupabaseClient, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['Admin', 'Staff']);
  if (!auth.allowed) return auth.response;
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) return NextResponse.json(data);
  }
  return NextResponse.json(fallbackUsers);
}
