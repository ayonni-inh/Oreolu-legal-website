import { NextRequest, NextResponse } from 'next/server';
import {
  addLog,
  fallbackAppointments,
  getSupabaseClient,
  getUserEmail,
  requireRole,
  sendEmail,
} from '@/lib/server/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireRole(req, ['Admin', 'Staff']);
    if (!auth.allowed) return auth.response;
    const { status, adminName, notifyClient } = await req.json();
    addLog('APPOINTMENT_STATUS_UPDATE', adminName || auth.session.id, `Changed appointment ${id} status to ${status}`);
    const supabase = getSupabaseClient();
    let updatedAppt: any = null;
    if (supabase) {
      const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select();
      if (error) throw error;
      updatedAppt = data[0];
    } else {
      const index = fallbackAppointments.findIndex((a) => a.id === id);
      if (index !== -1) {
        fallbackAppointments[index].status = status;
        updatedAppt = fallbackAppointments[index];
      }
      if (!updatedAppt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (status === 'APPROVED' && notifyClient && updatedAppt) {
      const clientInfo = await getUserEmail(updatedAppt.user_id);
      if (clientInfo?.email) {
        await sendEmail(clientInfo.email, `✅ Appointment Confirmed — ${updatedAppt.service_title} on ${updatedAppt.appointment_date}`, '<div>...</div>');
      }
    }
    return NextResponse.json(updatedAppt);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
