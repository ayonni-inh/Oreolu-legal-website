import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';

interface Props {
  token: string;
  onSuccess: (user: any) => void;
}

export default function SetPasswordModal({ token, onSuccess }: Props) {
  const [info, setInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setInfo(d); })
      .catch(() => setError('Failed to load invitation.'))
      .finally(() => setLoading(false));
  }, [token]);

  const activate = async () => {
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    setError('');
    try {
      const r = await fetch(`/api/invite/${token}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const d = await r.json();
      if (d.error) { setError(d.error); return; }
      setDone(true);
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('invite');
        window.history.replaceState({}, '', url.toString());
        onSuccess(d.user);
      }, 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-navy px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src="/eagle-logo-transparent.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
            <span className="font-bold text-white text-sm tracking-tight leading-tight">OROELU GODWIN AGIDI & CO</span>
          </div>
          <p className="text-gold text-xs tracking-widest uppercase">Staff Portal</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Verifying invitation…</div>
          ) : error && !info ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-rose-500" />
              </div>
              <h2 className="font-serif text-xl font-bold text-navy mb-2">Invalid Invitation</h2>
              <p className="text-rose-500 text-sm font-medium">{error}</p>
              <p className="text-gray-400 text-xs mt-2">This link may have already been used or has expired. Contact your administrator.</p>
            </div>
          ) : done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-navy">Account Activated!</h2>
              <p className="text-gray-500 mt-2">Signing you in to the staff portal…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-navy" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-navy">Activate Your Account</h2>
                <p className="text-gray-500 mt-2 text-sm">
                  Welcome, <strong>{info?.firstName} {info?.lastName}</strong>!<br />
                  Set a password to access your staff portal.
                </p>
                <p className="text-xs text-gray-400 mt-1">{info?.email}</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-navy transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && activate()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
                {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
                <button
                  onClick={activate}
                  disabled={saving}
                  className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50 text-sm">
                  {saving ? 'Activating…' : 'Activate Account & Sign In'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
