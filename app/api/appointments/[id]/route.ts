import { NextRequest, NextResponse } from 'next/server';
import { fallbackAppointments, getSupabaseClient, requireRole } from '@/lib/server/shared';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(req, ['Admin', 'Staff', 'Client']);
    if (!auth.allowed) return auth.response;
    const { id } = await params;
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    const index = fallbackAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      fallbackAppointments.splice(index, 1);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
