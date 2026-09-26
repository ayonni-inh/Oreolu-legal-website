import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/server/shared';
import { getSupabaseAdminClient } from '@/lib/server/admin';

function htmlResponse(title: string, message: string, success = true) {
  const color = success ? '#15803d' : '#b91c1c';

  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="
        margin:0;
        padding:40px 20px;
        background:#f5f5f5;
        font-family:Arial,sans-serif;
        color:#1f2937;
      ">
        <div style="
          max-width:520px;
          margin:60px auto;
          background:white;
          padding:40px;
          border-radius:12px;
          box-shadow:0 4px 20px rgba(0,0,0,.08);
          text-align:center;
        ">
          <div style="
            font-size:48px;
            margin-bottom:20px;
          ">
            ${success ? '✓' : '!' }
          </div>

          <h1 style="
            margin:0 0 15px;
            color:${color};
            font-size:28px;
          ">
            ${title}
          </h1>

          <p style="
            font-size:16px;
            line-height:1.6;
            margin-bottom:30px;
          ">
            ${message}
          </p>

          ${
            success
              ? `
                <a
                  href="${getBaseUrl()}"
                  style="
                    display:inline-block;
                    background:#0b1f3a;
                    color:white;
                    padding:13px 24px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;
                  "
                >
                  Return to OROELU GODWIN AGIDI & CO
                </a>
              `
              : `
                <a
                  href="${getBaseUrl()}"
                  style="
                    display:inline-block;
                    background:#0b1f3a;
                    color:white;
                    padding:13px 24px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;
                  "
                >
                  Return to Website
                </a>
              `
          }
        </div>
      </body>
    </html>
    `,
    {
      status: success ? 200 : 400,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return htmlResponse(
        'Invalid Verification Link',
        'This email verification link is missing its verification token.',
        false
      );
    }

    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return htmlResponse(
        'Verification Unavailable',
        'The email verification service is currently unavailable. Please try again later.',
        false
      );
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const { data: verificationToken, error: tokenLookupError } =
      await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .maybeSingle();

    if (tokenLookupError || !verificationToken) {
      return htmlResponse(
        'Invalid Verification Link',
        'This verification link is invalid or does not exist. Please request a new verification email.',
        false
      );
    }

    if (verificationToken.used_at) {
      return htmlResponse(
        'Link Already Used',
        'This email verification link has already been used. Your account may already be verified.',
        false
      );
    }

    if (new Date(verificationToken.expires_at).getTime() < Date.now()) {
      return htmlResponse(
        'Verification Link Expired',
        'This verification link has expired. Please request a new verification email.',
        false
      );
    }

    const { data: user, error: userLookupError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, status, email_verified_at')
      .eq('id', verificationToken.user_id)
      .maybeSingle();

    if (userLookupError || !user) {
      return htmlResponse(
        'Account Not Found',
        'We could not find the account associated with this verification link.',
        false
      );
    }

    if (user.email_verified_at || user.status === 'ACTIVE') {
      await supabase
        .from('email_verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', verificationToken.id);

      return htmlResponse(
        'Email Already Verified',
        'Your email address has already been verified. You can now log in to your client account.'
      );
    }

    const verifiedAt = new Date().toISOString();

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        email_verified_at: verifiedAt,
        status: 'ACTIVE',
        updated_at: verifiedAt,
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Email verification user update failed:', userUpdateError);

      return htmlResponse(
        'Verification Failed',
        'We could not activate your account right now. Please try the verification link again.',
        false
      );
    }

    const { error: tokenUpdateError } = await supabase
      .from('email_verification_tokens')
      .update({
        used_at: verifiedAt,
      })
      .eq('id', verificationToken.id);

    if (tokenUpdateError) {
      console.error('Email verification token update failed:', tokenUpdateError);

      return htmlResponse(
        'Verification Completed',
        'Your email has been verified and your account is active. You can now log in.'
      );
    }

    return htmlResponse(
      'Email Verified Successfully',
      `Welcome ${user.first_name || ''}! Your email address has been confirmed and your client account is now active. You can log in to access your dashboard.`
    );
  } catch (error) {
    console.error('Email verification failed:', error);

    return htmlResponse(
      'Verification Failed',
      'Something went wrong while verifying your email. Please try again later.',
      false
    );
  }
}