import { NextRequest, NextResponse } from 'next/server';
import {
  fallbackUsers,
  getSupabaseClient,
  recordActivity,
  setSessionCookie,
  verifyPassword,
} from '@/lib/server/shared';

/**
 * Backend bypass login for admin/developer use.
 *
 * This endpoint behaves exactly like /api/auth/login but guarantees the
 * fallback admin is usable even if Supabase is connected but the schema is
 * incomplete (e.g. missing password_hash column). It is not a passwordless
 * backdoor: it still requires the admin email and password.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // First, try the database as usual.
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
        // Ignore DB errors and fall back to in-memory users.
      }
    }

    // If the DB user has no password hash (e.g. schema was incomplete when inserted),
    // prefer the in-memory fallback user if it has a usable password hash.
    if (!user?.passwordHash) {
      const fallback = fallbackUsers.find((u) => u.email === email);
      if (fallback) user = fallback;
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
      details: `${user.appRole} logged in via dev-login bypass`,
    });

    const { passwordHash: _h, password_hash: _p, ...safeUser } = user;
    const response = NextResponse.json({ success: true, user: safeUser });
    setSessionCookie(response, safeUser as any);
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
