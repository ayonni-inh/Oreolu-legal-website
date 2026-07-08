'use client';

import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/src/components/Header';
import Hero from '@/src/components/Hero';
import ServiceGrid from '@/src/components/ServiceGrid';
import BookingModal from '@/src/components/BookingModal';
import RegistrationModal from '@/src/components/RegistrationModal';
import LoginModal from '@/src/components/LoginModal';
import WelcomeTour from '@/src/components/WelcomeTour';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import LegalChatbot from '@/src/components/LegalChatbot';
import SetPasswordModal from '@/src/components/SetPasswordModal';
import { ShieldCheck } from 'lucide-react';

const LegalResearch = dynamic(() => import('@/src/components/LegalResearch'));
const AboutUs = dynamic(() => import('@/src/components/AboutUs'));
const ContactUs = dynamic(() => import('@/src/components/ContactUs'));
const LegalDashboard = dynamic(() => import('@/src/components/LegalDashboard'));
const AdminAIPanel = dynamic(() => import('@/src/components/AdminAIPanel'));
const ClientDashboard = dynamic(() => import('@/src/components/ClientDashboard'));
const ProfilePage = dynamic(() => import('@/src/components/ProfilePage'));
const TermsOfService = dynamic(() => import('@/src/components/TermsOfService'));
const PrivacyPolicy = dynamic(() => import('@/src/components/PrivacyPolicy'));
const Blog = dynamic(() => import('@/src/components/Blog'));

const Forbidden = ({ onReturnHome }: { onReturnHome?: () => void }) => (
  <div className="pt-40 pb-60 px-6 text-center">
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ShieldCheck className="w-10 h-10 text-red-600" />
    </div>
    <h1 className="text-4xl font-serif font-bold text-navy mb-4">Access Denied</h1>
    <p className="text-gray-600 max-w-md mx-auto">
      You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
    </p>
    <button 
      onClick={onReturnHome}
      className="mt-8 bg-navy text-white px-8 py-3 rounded-lg font-semibold"
    >
      Return Home
    </button>
  </div>
);

export default function Portal() {
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [pendingService, setPendingService] = useState<any | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isWelcomeTourOpen, setIsWelcomeTourOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) setInviteToken(token);
  }, []);

  useEffect(() => {
    const pageFromPath = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/\//g, '-');
    setCurrentPage(pageFromPath || 'home');
  }, [pathname]);

  // Restore session from cookie on initial mount so logins survive reloads
  // and the "Return Home" button on the Forbidden page does not log the user out.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return;
        const { user } = await res.json();
        if (user && !cancelled) {
          flushSync(() => setCurrentUser(user));
          flushSync(() => setIsLoggedIn(true));
        }
      } catch {
        // Ignore — user will see normal logged-out UI.
      } finally {
        if (!cancelled) setIsRestoringSession(false);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, []);

  const navigate = (page: string) => {
    if (page === 'home') {
      router.push('/');
    } else {
      router.push('/' + page);
    }
    setCurrentPage(page);
  };

  const triggerDashboardRefresh = () => setDashboardRefreshTrigger(prev => prev + 1);

  const renderPage = () => {
    if (isRestoringSession) {
      return (
        <div className="pt-40 pb-60 px-6 text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Restoring your session...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        if (!currentUser) return <Forbidden onReturnHome={() => navigate('home')} />;
        if (currentUser.appRole === 'Client') {
          return (
            <ClientDashboard
              user={currentUser}
              onUpdateUser={(data) => setCurrentUser((prev: any) => ({ ...prev, ...data }))}
              onBookService={(service) => setSelectedService(service)}
              refreshTrigger={dashboardRefreshTrigger}
            />
          );
        }
        if (currentUser.appRole === 'Staff') {
          return <LegalDashboard user={currentUser} onNavigate={navigate} />;
        }
        return <Forbidden onReturnHome={() => navigate('home')} />;
      case 'legal-research':
        return <LegalResearch />;
      case 'about-us':
        return <AboutUs />;
      case 'blog':
        return <Blog />;
      case 'contact-us':
        return <ContactUs />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={navigate} />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'admin-panel':
      case 'ai-center':
        return currentUser?.appRole === 'Admin' ? (
          <AdminAIPanel user={currentUser} />
        ) : <Forbidden onReturnHome={() => navigate('home')} />;
      case 'staff-portal':
        return currentUser?.appRole === 'Staff' ? (
          <LegalDashboard user={currentUser} onNavigate={navigate} />
        ) : <Forbidden onReturnHome={() => navigate('home')} />;
      case 'admin-dashboard':
        return currentUser?.appRole === 'Admin' ? (
          <LegalDashboard user={currentUser} onNavigate={navigate} />
        ) : <Forbidden onReturnHome={() => navigate('home')} />;
      case 'profile':
        return currentUser ? (
          <ProfilePage user={currentUser} onNavigate={navigate} onUpdateUser={(data) => setCurrentUser((prev: any) => ({ ...prev, ...data }))} />
        ) : <Forbidden onReturnHome={() => navigate('home')} />;
      case 'home':
      default:
        return (
          <>
            <Hero onGetStarted={() => setIsWelcomeTourOpen(true)} />
            {(!currentUser || currentUser.appRole === 'Client') && (
              <ServiceGrid onBookService={(service) => setSelectedService(service)} />
            )}
          </>
        );
    }
  };

  const handleLogin = (userData?: any) => {
    if (userData && userData.firstName) {
      flushSync(() => setCurrentUser(userData));
    } else {
      const demoUser = {
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Acme Corp',
        clientId: '#88392',
        email: 'demo@example.com',
        appRole: 'Client'
      };
      flushSync(() => setCurrentUser(demoUser));
      userData = demoUser;
    }
    flushSync(() => setIsLoggedIn(true));

    if (!pendingService) {
      if (userData?.appRole === 'Admin') navigate('admin-dashboard');
      else if (userData?.appRole === 'Staff') navigate('staff-portal');
      else navigate('dashboard');
    } else {
      setSelectedService(pendingService);
      setPendingService(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <Header 
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onRegisterClick={() => setIsRegistrationOpen(true)} 
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
        onNavigate={navigate}
        currentPage={currentPage}
      />
      
      <main>
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>

      <footer className="bg-navy text-white pt-14 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/eagle-logo-transparent.png" alt="" className="w-10 h-10 object-contain brightness-0 invert opacity-70" />
                <div className="leading-tight">
                  <div className="font-bold text-white text-xs tracking-tight">OROELU GODWIN</div>
                  <div className="font-bold text-gold text-xs tracking-tight">AGIDI &amp; CO</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modern legal representation. Transparent pricing. Accessible anywhere.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gold">Services</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors text-left">Corporate Law</button></li>
                <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors text-left">Litigation</button></li>
                <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors text-left">Contracts</button></li>
                <li><button onClick={() => navigate('about-us')} className="hover:text-white transition-colors text-left">About Us</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gold">Portal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => setIsLoginOpen(true)} className="hover:text-white transition-colors text-left">Client Login</button></li>
                <li><button onClick={() => setIsRegistrationOpen(true)} className="hover:text-white transition-colors text-left">Register Account</button></li>
                <li><button onClick={() => navigate('legal-research')} className="hover:text-white transition-colors text-left">Legal Research</button></li>
                <li><button onClick={() => navigate('blog')} className="hover:text-white transition-colors text-left">Blog</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gold">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="tel:+2348033201909" className="hover:text-white transition-colors">+234 803 320 1909</a></li>
                <li><a href="mailto:ogacosolicitors@gmail.com" className="hover:text-white transition-colors">ogacosolicitors@gmail.com</a></li>
                <li className="leading-relaxed text-xs">
                  HERITAGE &amp; GRACE CHAMBERS,<br />
                  SUITE C20/C21, CHERUB MALL,<br />
                  New Road Bus Stop,<br />
                  KM 18 Lekki - Epe Expy,<br />
                  Lekki 106104, Lagos
                </li>
                <li className="leading-relaxed text-xs pt-1">
                  <span className="text-gold font-semibold">OJO OFFICE:</span><br />
                  Suite 5/6, 2nd Floor, Plot 4,<br />
                  Alaba Int&apos;l Market Road,<br />
                  Opposite Total Station,<br />
                  Ojo, Lagos State
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} OROELU GODWIN AGIDI &amp; CO. All rights reserved.</p>
                <p className="mt-2 text-[10px] leading-relaxed max-w-2xl text-gray-500">
                  <span className="text-gold font-bold uppercase tracking-widest">Legal Disclaimer: </span>
                  The information on this website is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by use of this site. OROELU GODWIN AGIDI &amp; CO is a registered law firm in Nigeria.
                </p>
              </div>
              <div className="flex gap-5 shrink-0 text-sm text-gray-400">
                <button onClick={() => navigate('terms-of-service')} className="hover:text-white transition-colors">Terms</button>
                <button onClick={() => navigate('privacy-policy')} className="hover:text-white transition-colors">Privacy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
          isLoggedIn={isLoggedIn}
          user={currentUser}
          onLoginRequired={() => {
            setPendingService(selectedService);
            setSelectedService(null);
            setIsLoginOpen(true);
          }}
          onSuccess={triggerDashboardRefresh}
        />
      )}

      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
        onSuccess={handleLogin}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(userData) => {
          setIsLoginOpen(false);
          handleLogin(userData);
        }}
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegistrationOpen(true);
        }}
      />

      {isWelcomeTourOpen && (
        <WelcomeTour 
          onClose={() => setIsWelcomeTourOpen(false)}
          onComplete={() => {
            setIsWelcomeTourOpen(false);
            setIsRegistrationOpen(true);
          }}
        />
      )}

      <LegalChatbot />

      {inviteToken && (
        <SetPasswordModal
          token={inviteToken}
          onSuccess={(userData) => {
            setInviteToken(null);
            handleLogin(userData);
          }}
        />
      )}
    </div>
  );
}
