import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceGrid from './components/ServiceGrid';
import BookingModal from './components/BookingModal';
import RegistrationModal from './components/RegistrationModal';
import LoginModal from './components/LoginModal';
import LegalResearch from './components/LegalResearch';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import LegalDashboard from './components/LegalDashboard';
import AdminAIPanel from './components/AdminAIPanel';
import ClientDashboard from './components/ClientDashboard';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import WelcomeTour from './components/WelcomeTour';
import Blog from './components/Blog';
import { ErrorBoundary } from './components/ErrorBoundary';
import LegalChatbot from './components/LegalChatbot';
import SetPasswordModal from './components/SetPasswordModal';

const Forbidden = () => (
  <div className="pt-40 pb-60 px-6 text-center">
    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ShieldCheck className="w-10 h-10 text-red-600" />
    </div>
    <h1 className="text-4xl font-serif font-bold text-navy mb-4">Access Denied</h1>
    <p className="text-gray-600 max-w-md mx-auto">
      You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
    </p>
    <button 
      onClick={() => window.location.href = '/'}
      className="mt-8 bg-navy text-white px-8 py-3 rounded-lg font-semibold"
    >
      Return Home
    </button>
  </div>
);

import { ShieldCheck } from 'lucide-react';

export default function App() {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) setInviteToken(token);
  }, []);

  const triggerDashboardRefresh = () => setDashboardRefreshTrigger(prev => prev + 1);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (!currentUser) return <Forbidden />;
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
          return <LegalDashboard user={currentUser} />;
        }
        return <Forbidden />;
      case 'legal-research':
        return <LegalResearch />;
      case 'about-us':
        return <AboutUs />;
      case 'blog':
        return <Blog />;
      case 'contact-us':
        return <ContactUs />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={setCurrentPage} />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'admin-panel':
      case 'ai-center':
        return currentUser?.appRole === 'Admin' ? (
          <AdminAIPanel user={currentUser} />
        ) : <Forbidden />;
      case 'staff-portal':
        return currentUser?.appRole === 'Staff' ? (
          <LegalDashboard user={currentUser} />
        ) : <Forbidden />;
      case 'admin-dashboard':
        return currentUser?.appRole === 'Admin' ? (
          <LegalDashboard user={currentUser} />
        ) : <Forbidden />;
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
      setCurrentUser(userData);
    } else {
      const demoUser = {
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Acme Corp',
        clientId: '#88392',
        email: 'demo@example.com',
        appRole: 'Client'
      };
      setCurrentUser(demoUser);
      userData = demoUser;
    }
    setIsLoggedIn(true);
    
    // Auto-navigate based on role if not a pending service
    if (!pendingService) {
      if (userData?.appRole === 'Admin') setCurrentPage('admin-dashboard');
      else if (userData?.appRole === 'Staff') setCurrentPage('staff-portal');
      else setCurrentPage('dashboard');
    } else {
      setSelectedService(pendingService);
      setPendingService(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header 
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onRegisterClick={() => setIsRegistrationOpen(true)} 
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />
      
      <main>
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white pt-14 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
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

            {/* Services */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gold">Services</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors text-left">Corporate Law</button></li>
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors text-left">Litigation</button></li>
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors text-left">Contracts</button></li>
                <li><button onClick={() => setCurrentPage('about-us')} className="hover:text-white transition-colors text-left">About Us</button></li>
              </ul>
            </div>

            {/* Portal */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-gold">Portal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><button onClick={() => setIsLoginOpen(true)} className="hover:text-white transition-colors text-left">Client Login</button></li>
                <li><button onClick={() => setIsRegistrationOpen(true)} className="hover:text-white transition-colors text-left">Register Account</button></li>
                <li><button onClick={() => setCurrentPage('legal-research')} className="hover:text-white transition-colors text-left">Legal Research</button></li>
                <li><button onClick={() => setCurrentPage('blog')} className="hover:text-white transition-colors text-left">Blog</button></li>
              </ul>
            </div>

            {/* Contact */}
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
                  Alaba Int'l Market Road,<br />
                  Opposite Total Station,<br />
                  Ojo, Lagos State
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
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
                <button onClick={() => setCurrentPage('terms-of-service')} className="hover:text-white transition-colors">Terms</button>
                <button onClick={() => setCurrentPage('privacy-policy')} className="hover:text-white transition-colors">Privacy</button>
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
