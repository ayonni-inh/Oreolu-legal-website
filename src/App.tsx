import { useState } from 'react';
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
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import WelcomeTour from './components/WelcomeTour';
import Blog from './components/Blog';
import { ErrorBoundary } from './components/ErrorBoundary';
import LegalChatbot from './components/LegalChatbot';

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

  const triggerDashboardRefresh = () => setDashboardRefreshTrigger(prev => prev + 1);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return currentUser?.appRole === 'Admin' ? (
          <LegalDashboard user={currentUser} />
        ) : <LegalDashboard user={currentUser} />;
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
        return ['Admin', 'Staff'].includes(currentUser?.appRole) ? (
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
      if (userData?.appRole === 'Admin') setCurrentPage('ai-center');
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
      <footer className="bg-navy text-white py-12 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex flex-col items-center mb-6">
              <span className="font-bold text-white text-base tracking-tight text-center leading-tight">OROELU GODWIN AGIDI</span>
              <span className="font-bold text-white text-base tracking-tight text-center leading-tight">& CO</span>
            </div>
            <p className="text-gray-400 text-sm">
              Modern legal representation. Transparent pricing. Accessible anywhere.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4 text-gold">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Corporate Law</button></li>
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Litigation</button></li>
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Contracts</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4 text-gold">Portal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => setIsLoginOpen(true)} className="hover:text-white transition-colors">Client Login</button></li>
              <li><button onClick={() => setIsRegistrationOpen(true)} className="hover:text-white transition-colors">Register Account</button></li>
              <li><button onClick={() => setIsLoginOpen(true)} className="hover:text-white transition-colors">Secure Upload</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold mb-4 text-gold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>+234 803 320 1909</li>
              <li>contact@ogagidi.com</li>
              <li>SUITE C20/C21, CHERUB MALL,<br/>New Road Bus Stop,<br/>KM 18 Lekki - Epe Expy,<br/>Lekki Penninsula II,<br/>Lekki 106104, Lagos</li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div className="flex-1">
            <p>&copy; {new Date().getFullYear()} OROELU GODWIN AGIDI & CO. All rights reserved.</p>
            <p className="mt-2 text-[10px] leading-relaxed max-w-2xl">
              <span className="text-gold font-bold uppercase tracking-widest block mb-1">Legal Disclaimer:</span>
              The information provided on this website is for general informational purposes only and does not constitute legal advice. No attorney-client relationship is formed by the use of this site or the submission of information through our portal. OROELU GODWIN AGIDI & CO is a registered law firm in Nigeria.
            </p>
          </div>
          <div className="flex gap-6 shrink-0">
            <button onClick={() => setCurrentPage('terms-of-service')} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => setCurrentPage('privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button>
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
    </div>
  );
}
