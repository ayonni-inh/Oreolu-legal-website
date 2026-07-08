import { NextRequest, NextResponse } from 'next/server';
import {
  fallbackUsers,
  getSupabaseClient,
  loadUserById,
  recordActivity,
  setSessionCookie,
  verifyPassword,
} from '@/lib/server/shared';

/**
 * Development-only emergency login endpoint.
 *
 * In production this endpoint is disabled unless a `DEV_LOGIN_SECRET` env var
 * is configured and the caller provides it. It is intended only for local
 * development or rare recovery scenarios where the standard login route
 * cannot be used. It never overrides the password or status of an existing
 * database account with fallback credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, devSecret } = await req.json();

    // Production guard: disable unless a secret is configured and matches.
    const configuredSecret = process.env.DEV_LOGIN_SECRET;
    if (process.env.NODE_ENV === 'production') {
      if (!configuredSecret || devSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // Look up the database account first. If it exists, we always use the
    // DB password and status; fallback credentials are never substituted
    // for a real account.
    let user: any = null;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (data) {
          user = {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            passwordHash: data.password_hash,
            appRole: data.app_role,
            companyName: data.company_name,
            industry: data.industry,
            jobTitle: data.job_title,
            clientId: data.client_id,
            status: data.status,
            permissions: data.permissions || [],
          };
        }
      } catch {
        // Supabase unavailable — fall through to in-memory users only when
        // there is no database record.
      }
    }

    if (!user) {
      user = fallbackUsers.find((u) => u.email === email) || null;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 401 },
      );
    }

    if (user.status === 'PENDING') {
      return NextResponse.json(
        { error: 'PENDING', message: 'Your account is pending approval' },
        { status: 403 },
      );
    }
    if (user.status === 'BLOCKED') {
      return NextResponse.json(
        { error: 'BLOCKED', message: 'This account has been suspended' },
        { status: 403 },
      );
    }

    const storedHash = user.passwordHash || user.password_hash;
    if (!storedHash) {
      return NextResponse.json(
        {
          error:
            'Account has no password set. Please use the invitation link to set your password.',
        },
        { status: 401 },
      );
    }
    if (!verifyPassword(password, storedHash)) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 },
      );
    }

    recordActivity({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorRole: user.appRole,
      category: 'AUTH',
      action: 'USER_LOGIN',
      target: user.email,
      details: `${user.appRole} logged in via dev-login`,
    });

    const { passwordHash: _h, password_hash: _p, ...safeUser } = user;
    const response = NextResponse.json({ success: true, user: safeUser });
    setSessionCookie(response, safeUser as any);
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
