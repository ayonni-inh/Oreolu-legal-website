import { useState, FormEvent, useRef, useEffect } from 'react';
import { X, AlertCircle, ArrowRight, CheckCircle2, Shield, Users, User, Clock, Lock as LockIcon } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData?: any) => void;
  onRegisterClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess, onRegisterClick }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot-password' | 'forgot-password-success' | 'pending-approval' | 'blocked'>('login');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset state when closed
      setTimeout(() => {
        setView('login');
        setEmail('');
        setPassword('');
        setError(null);
      }, 300);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call for login
    setTimeout(async () => {
      setIsSubmitting(false);
      
      try {
        // Fetch users to find out status
        const res = await fetch(`/api/users?role=Admin`);
        const allUsers = await res.json();
        const foundUser = allUsers.find((u: any) => u.email === email);

        if (foundUser) {
           if (foundUser.status === 'PENDING') {
             setView('pending-approval');
             return;
           }
           if (foundUser.status === 'BLOCKED') {
             setView('blocked');
             return;
           }
           onSuccess(foundUser);
           return;
        }
      } catch (e) {
        console.warn("Could not check status, proceeding with default logic");
      }

      // Determine role based on email or selections
      let userData: any = {
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Acme Corp',
        clientId: '#88392',
        email: email,
        appRole: 'Client',
        status: 'ACTIVE'
      };

      if (email === 'admin@firm.com') {
        userData = {
          id: 'admin-1',
          firstName: 'John',
          lastName: 'Admin',
          companyName: 'Agidi Tech Firm',
          clientId: 'ADMIN-SYS',
          email: 'admin@firm.com',
          appRole: 'Admin',
          status: 'ACTIVE'
        };
      } else if (email === 'sarah@firm.com') {
        userData = {
          id: 'legal-1',
          firstName: 'Sarah',
          lastName: 'Smith',
          companyName: 'Agidi Tech Firm',
          clientId: 'STAFF-001',
          email: 'sarah@firm.com',
          appRole: 'Staff',
          status: 'ACTIVE'
        };
      } else if (email === 'ogouifemi@gmail.com') {
        userData = {
          id: 'client-1',
          firstName: 'Godwin',
          lastName: 'Agidi',
          companyName: 'Agidi Tech',
          clientId: 'client-1',
          email: 'ogouifemi@gmail.com',
          appRole: 'Client',
          status: 'ACTIVE'
        };
      }

      onSuccess(userData);
    }, 1000);
  };

  const quickLogin = (role: 'Client' | 'Staff' | 'Admin') => {
    const creds = {
      Admin: { e: 'admin@firm.com', p: 'password' },
      Staff: { e: 'sarah@firm.com', p: 'password' },
      Client: { e: 'ogouifemi@gmail.com', p: 'password' }
    };
    setEmail(creds[role].e);
    setPassword(creds[role].p);
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }
      
      setView('forgot-password-success');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="bg-navy text-white p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold">
              {view === 'login' ? 'Client Login' : 'Reset Password'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-white transition-colors relative z-10 p-2 focus-visible:ring-2 focus-visible:ring-gold rounded-full outline-none"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {view === 'login' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              {/* Quick Access Roles */}
              <div className="mb-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Quick Access Roles</p>
                <div className="grid grid-cols-3 gap-2">
                   <button 
                    onClick={() => quickLogin('Admin')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all group"
                   >
                     <Shield className="w-5 h-5 text-gray-400 group-hover:text-gold" />
                     <span className="text-[10px] font-bold text-gray-600 group-hover:text-navy">Admin</span>
                   </button>
                   <button 
                    onClick={() => quickLogin('Staff')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-navy hover:bg-navy/5 transition-all group"
                   >
                     <Users className="w-5 h-5 text-gray-400 group-hover:text-navy" />
                     <span className="text-[10px] font-bold text-gray-600 group-hover:text-navy">Legal</span>
                   </button>
                   <button 
                    onClick={() => quickLogin('Client')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                   >
                     <User className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                     <span className="text-[10px] font-bold text-gray-600 group-hover:text-emerald-600">Client</span>
                   </button>
                </div>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-white px-3 text-gray-300">Or Continue With Email</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  ref={firstInputRef}
                  id="login-email"
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="jane@example.com"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button 
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-xs font-semibold text-navy hover:text-gold transition-colors outline-none focus-visible:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  id="login-password"
                  required type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 outline-none mb-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Login <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                )}
              </button>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    onRegisterClick();
                  }}
                  className="font-semibold text-navy hover:text-gold transition-colors outline-none focus-visible:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          </div>
        )}

          {view === 'pending-approval' && (
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-amber-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy mb-4">Registration Pending</h3>
              <p className="text-gray-600 text-sm mb-8 px-4">
                Your account is currently in the <span className="font-bold">Super Admin Approval Queue</span>. 
                Please allow up to 24 hours for manual verification of firm credentials.
              </p>
              <button 
                onClick={() => setView('login')}
                className="w-full bg-navy text-white px-8 py-3 rounded-lg font-semibold transition-colors outline-none"
              >
                Return to Login
              </button>
            </div>
          )}

          {view === 'blocked' && (
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LockIcon className="w-8 h-8 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy mb-4">Access Revoked</h3>
              <p className="text-gray-600 text-sm mb-8 px-4">
                A <span className="font-bold">Super Admin Override</span> has disabled this account. 
                Contact the firm's compliance department if you believe this is an error.
              </p>
              <button 
                onClick={() => setView('login')}
                className="w-full bg-navy text-white px-8 py-3 rounded-lg font-semibold transition-colors outline-none"
              >
                Return to Login
              </button>
            </div>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="animate-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="mb-6">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  ref={firstInputRef}
                  id="reset-email"
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all" 
                  placeholder="jane@example.com"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 outline-none mb-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setView('login')}
                  className="text-sm font-semibold text-navy hover:text-gold transition-colors outline-none focus-visible:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {view === 'forgot-password-success' && (
            <div className="text-center py-4 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy mb-2">Check Your Email</h3>
              <p className="text-gray-600 text-sm mb-6">
                If an account exists for <span className="font-semibold">{email}</span>, we have sent a password reset link.
              </p>
              <button 
                onClick={() => setView('login')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-navy px-8 py-3 rounded-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-300 outline-none"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
