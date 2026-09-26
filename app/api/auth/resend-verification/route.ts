import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, sendEmail } from '@/lib/server/shared';
import { getSupabaseAdminClient } from '@/lib/server/admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Authentication service is unavailable' },
        { status: 500 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, status')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error('Resend verification user lookup failed:', userError);

      return NextResponse.json(
        { error: 'Unable to process verification request' },
        { status: 500 }
      );
    }

    // Don't reveal whether an email exists.
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'If an account exists for this email address, a new verification link has been sent.',
      });
    }

    if (user.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'This account is already verified. You can log in.',
      });
    }

    // Invalidate previous unused tokens.
    await supabase
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id.toString())
      .is('used_at', null);

    // Generate a fresh token.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id.toString(),
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (tokenError) {
      console.error('Verification token creation failed:', tokenError);

      return NextResponse.json(
        { error: 'Unable to create verification link' },
        { status: 500 }
      );
    }

    const verificationUrl =
      `${getBaseUrl()}/api/auth/verify-email?token=${rawToken}`;

    const firstName = user.first_name || 'there';

    const emailSent = await sendEmail(
      user.email,
      'Verify your OGA Legal client account',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your email address</h2>

          <p>Hello ${firstName},</p>

          <p>
            We received a request to verify your OGA Legal client account.
          </p>

          <p>
            Please click the button below to verify your email address:
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#111827;
                color:#ffffff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Verify Email Address
            </a>
          </p>

          <p>
            This verification link expires in 24 hours.
          </p>

          <p>
            If you did not request this, you can safely ignore this email.
          </p>

          <p>
            OGA Legal
          </p>
        </div>
      `
    );

    if (!emailSent) {
      console.error('Verification email could not be sent');

      return NextResponse.json(
        { error: 'Unable to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'A new verification link has been sent to your email address.',
    });
  } catch (error) {
    console.error('Resend verification failed:', error);

    return NextResponse.json(
      { error: 'Unable to resend verification email' },
      { status: 500 }
    );
  }
}