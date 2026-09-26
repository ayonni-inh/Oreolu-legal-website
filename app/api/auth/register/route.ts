import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  fallbackUsers,
  generateClientId,
  getBaseUrl,
  hashPassword,
  recordActivity,
  sendEmail,
} from '@/lib/server/shared';
import { getSupabaseAdminClient } from '@/lib/server/admin';

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      companyName,
      industry,
      jobTitle,
      position,
    } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingMem = fallbackUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existingMem) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Registration service is not configured' },
        { status: 500 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingError) {
      console.error('Existing user lookup error:', existingError);

      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const clientId = generateClientId();
    const resolvedPosition = position || jobTitle || '';

    /*
     * Create the Supabase Auth account first.
     * The existing database trigger automatically creates public.users.
     */
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        firstName,
        lastName,
        phone: phone || '',
        companyName: companyName || '',
        industry: industry || '',
        jobTitle: resolvedPosition,
        clientId,
        appRole: 'Client',
      },
    });

    if (authError || !authData.user) {
      console.error(
        'Supabase Auth registration error:',
        authError
      );

      return NextResponse.json(
        {
          error:
            authError?.message ||
            'Could not create authentication account',
        },
        { status: 500 }
      );
    }

    const id = authData.user.id;
    const passwordHash = hashPassword(password);

    /*
     * handle_new_user() has already created public.users.
     * Update that row with the fields required by this application.
     */
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        password_hash: passwordHash,
        app_role: 'Client',
        company_name: companyName || '',
        industry: industry || '',
        job_title: resolvedPosition,
        client_id: clientId,
        status: 'EMAIL_UNVERIFIED',
        permissions: [],
        email_verified_at: null,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (userError || !updatedUser) {
      console.error('User registration update error:', userError);

      await supabase.auth.admin.deleteUser(id);

      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

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
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      ]);

    if (tokenError) {
      console.error(
        'Verification token error:',
        tokenError
      );

      await supabase.from('users').delete().eq('id', id);
      await supabase.auth.admin.deleteUser(id);

      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    const newUser: any = {
      id,
      firstName,
      lastName,
      email: normalizedEmail,
      phone: phone || '',
      passwordHash,
      appRole: 'Client',
      companyName: companyName || '',
      industry: industry || '',
      jobTitle: resolvedPosition,
      clientId,
      status: 'EMAIL_UNVERIFIED',
      permissions: [],
      emailVerifiedAt: null,
    };

    fallbackUsers.push(newUser);

    const verificationUrl =
      `${getBaseUrl()}/api/auth/verify-email?token=` +
      encodeURIComponent(rawToken);

    const verificationHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px;margin:auto">
        <h2>Welcome to OROELU GODWIN AGIDI &amp; CO</h2>

        <p>Hello ${firstName},</p>

        <p>
          Your client account has been created successfully.
          Please confirm your email address before logging in.
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="display:inline-block;background:#0b1f3a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none"
          >
            Verify My Email
          </a>
        </p>

        <p>
          This verification link expires in 24 hours and can only be used once.
        </p>

        <p>
          Your Client ID is <strong>${clientId}</strong>.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail(
      normalizedEmail,
      'Verify your OROELU GODWIN AGIDI & CO client account',
      verificationHtml
    );

    recordActivity({
      actorId: id,
      actorName: `${firstName} ${lastName}`,
      actorRole: 'Client',
      category: 'AUTH',
      action: 'USER_REGISTERED',
      target: clientId,
      details: `New Client registered; email verification required: ${normalizedEmail}`,
    });

  const responseUser = {
  id: newUser.id,
  firstName: newUser.firstName,
  lastName: newUser.lastName,
  email: newUser.email,
  phone: newUser.phone,
  appRole: newUser.appRole,
  companyName: newUser.companyName,
  industry: newUser.industry,
  jobTitle: newUser.jobTitle,
  clientId: newUser.clientId,
  status: newUser.status,
  permissions: newUser.permissions,
  emailVerifiedAt: newUser.emailVerifiedAt,
};


const response: any = {
  success: true,
  requiresEmailVerification: true,
  user: responseUser,
};

if (process.env.NODE_ENV !== 'production') {
  response.verificationUrl = verificationUrl;
}

return NextResponse.json(response, { status: 201 });

} catch (error) {
  console.error('Registration failed:', error);

  return NextResponse.json(
    { error: 'Registration failed' },
    { status: 500 }
  );
}
}