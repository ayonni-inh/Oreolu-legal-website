import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackAppointments, getStaffEmails, getSupabaseClient, getUserEmail, recordActivity, requireRole } from '@/lib/server/shared';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || '';
    const auth = requireRole(req, ['Admin', 'Staff']);
    const isPrivileged = auth.allowed;
    const supabase = getSupabaseClient();

    if (isPrivileged) {
      if (supabase) {
        const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }
      return NextResponse.json(fallbackAppointments);
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json(fallbackAppointments.filter((a) => a.user_id === userId));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireRole(req, ['Admin', 'Staff', 'Client']);
    if (!auth.allowed) return auth.response;
    const { userId, serviceTitle, date, time, price, trackingNumber, status, requesterName,
            consultationType, practiceArea, description, preferredLawyer, attachedDocCount } = await req.json();

    if (!userId || !serviceTitle || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const role = auth.session.role;
    const defaultStatus = (role === 'Admin') ? (status || 'APPROVED') : 'PENDING_ADMIN_APPROVAL';

    const newAppointment: any = {
      user_id: userId,
      service_title: serviceTitle,
      appointment_date: date,
      appointment_time: time,
      status: defaultStatus,
      price: price || 'TBD',
      tracking_number: trackingNumber || `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      created_at: new Date().toISOString(),
      ...(consultationType && { consultation_type: consultationType }),
      ...(practiceArea && { practice_area: practiceArea }),
      ...(description && { description }),
      ...(preferredLawyer && { preferred_lawyer: preferredLawyer }),
      ...(attachedDocCount && { attached_doc_count: attachedDocCount }),
    };

    if (defaultStatus === 'PENDING_ADMIN_APPROVAL') {
      addLog('APPOINTMENT_REQUESTED', requesterName || 'System', `New appointment ${newAppointment.tracking_number} entered approval queue.`);
    }
    recordActivity({
      actorId: userId,
      actorName: requesterName || 'Client',
      actorRole: role,
      category: 'APPOINTMENT',
      action: 'APPOINTMENT_CREATED',
      target: newAppointment.tracking_number,
      details: `${serviceTitle} booked for ${date} ${time}`
    });

    const supabase = getSupabaseClient();
    let savedAppt: any;
    if (supabase) {
      const { data, error } = await supabase.from('appointments').insert([newAppointment]).select();
      if (error) throw error;
      savedAppt = data[0];
    } else {
      savedAppt = { ...newAppointment, id: Math.random().toString(36).substr(2, 9) };
      fallbackAppointments.unshift(savedAppt);
    }

    if (defaultStatus === 'PENDING_ADMIN_APPROVAL') {
      const staffEmails = getStaffEmails();
      const clientInfo = await getUserEmail(userId);
      const clientDisplay = clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName} (${clientInfo.email})` : (requesterName || userId);
      const notifyHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#0a2540;padding:24px 32px;"><div style="color:#c9a14a;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">New Appointment Request</div>
        <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:6px;">OROELU GODWIN AGIDI & CO</div></div>
        <div style="padding:32px;">
          <p style="color:#374151;margin-bottom:16px;">A new consultation request requires your approval:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;">Client</td><td style="padding:8px 0;font-weight:bold;color:#0a2540;font-size:13px;">${clientDisplay}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Service</td><td style="padding:8px 0;font-weight:bold;color:#0a2540;font-size:13px;">${serviceTitle}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Date & Time</td><td style="padding:8px 0;font-weight:bold;color:#0a2540;font-size:13px;">${date} at ${time}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Tracking No.</td><td style="padding:8px 0;font-weight:bold;color:#0a2540;font-size:13px;">${newAppointment.tracking_number}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;">Log in to the admin portal to approve or reschedule this request.</p>
        </div></div>`;
      await import('@/lib/server/shared').then(m => m.sendEmail(staffEmails, `🔔 New Appointment Request: ${serviceTitle} — ${date}`, notifyHtml));
    }

    return NextResponse.json(savedAppt, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
