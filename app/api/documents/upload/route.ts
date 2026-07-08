import { NextRequest, NextResponse } from 'next/server';
import { addLog, fallbackDocuments, getStaffEmails, getSupabaseClient, recordActivity, requireRole, sendEmail } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['Admin', 'Staff', 'Client']);
    if (!auth.allowed) return auth.response;
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const role = auth.session.role;
    const userId = (role === 'Admin' || role === 'Staff') ? (form.get('userId') as string || auth.session.id) : auth.session.id;
    const uploaderName = form.get('uploaderName') as string || auth.session.email || 'User';

    const docId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const storagePath = `documents/${docId}/${file.name}`;
    const status = (role === 'Admin' || role === 'Staff') ? 'APPROVED' : 'PENDING_ADMIN_APPROVAL';
    let fileUrl: string | null = null;

    const supabase = getSupabaseClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (supabase) {
      const { error: storageErr } = await supabase.storage
        .from('firm-documents')
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });
      if (!storageErr) {
        const { data: urlData } = supabase.storage.from('firm-documents').getPublicUrl(storagePath);
        fileUrl = urlData?.publicUrl || null;
      } else {
        console.warn('Supabase Storage upload failed:', storageErr.message);
      }
    }

    const size = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    const newDoc: any = {
      id: docId,
      name: file.name,
      user_id: userId,
      size,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      status,
      storage_path: storagePath,
      file_url: fileUrl,
      uploader_role: role.toUpperCase(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      created_at: new Date().toISOString()
    };

    addLog('DOCUMENT_UPLOADED', uploaderName, `${file.name} uploaded by ${role}`);
    recordActivity({ actorName: uploaderName, actorRole: role, category: 'DOCUMENT', action: 'FILE_UPLOADED', target: docId, details: `${file.name} added to master repository` });

    let savedDoc: any = newDoc;
    if (supabase) {
      const { data, error } = await supabase.from('documents').insert([newDoc]).select();
      if (!error && data) savedDoc = data[0];
    } else {
      fallbackDocuments.unshift(newDoc);
    }

    if (role === 'Client') {
      const staffEmails = getStaffEmails();
      if (staffEmails.length > 0) {
        const notifyHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#0B1B3A;padding:28px 32px;">
    <h1 style="color:#C5A059;margin:0;font-size:20px;font-weight:700;">📎 New Document Uploaded</h1>
    <p style="color:#9ca3af;margin:6px 0 0;font-size:13px;">Agidi & Co Law Firm Portal</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#374151;font-size:15px;margin:0 0 20px;">A client has uploaded a new document to the master repository and it is awaiting your review.</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;width:140px;">Document</td><td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:700;">${file.name}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;">Uploaded by</td><td style="padding:12px 16px;color:#111827;font-size:14px;">${uploaderName}</td></tr>
      <tr><td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;">File size</td><td style="padding:12px 16px;color:#111827;font-size:14px;">${size}</td></tr>
      <tr style="background:#f3f4f6;"><td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;">Status</td><td style="padding:12px 16px;"><span style="background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:700;">Pending Review</span></td></tr>
    </table>
    <p style="color:#6b7280;font-size:13px;">Log in to the portal to review, approve, or reject this document.</p>
  </div>
</div>`;
        sendEmail(staffEmails, `📎 New Document Upload — ${file.name} (Pending Review)`, notifyHtml).catch(() => {});
      }
    }

    return NextResponse.json(savedDoc);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
