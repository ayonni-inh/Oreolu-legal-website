import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/server/shared';
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || email.trim() === '') return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    await sendEmail(trimmedEmail, 'Password Reset Request', `<p>You requested a password reset. Click <a href="#">here</a> to reset your password.</p>`);
    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}