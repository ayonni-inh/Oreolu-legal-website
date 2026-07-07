import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const sent = await sendEmail(to, subject, html);
    return NextResponse.json({ success: sent });
  } catch {
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}