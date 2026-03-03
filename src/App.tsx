import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceGrid from './components/ServiceGrid';
import BookingModal from './components/BookingModal';
import RegistrationModal from './components/RegistrationModal';
import LegalResearch from './components/LegalResearch';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import ClientDashboard from './components/ClientDashboard';
import TermsOfService from './components/TermsOfService';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [pendingService, setPendingService] = useState<any | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <ClientDashboard user={currentUser} />;
      case 'legal-research':
        return <LegalResearch />;
      case 'about-us':
        return <AboutUs />;
      case 'contact-us':
        return <ContactUs />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <ServiceGrid onBookService={(service) => setSelectedService(service)} />
          </>
        );
    }
  };

  const handleLogin = (userData?: any) => {
    if (userData && userData.firstName) {
      setCurrentUser(userData);
    } else {
      setCurrentUser({
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Acme Corp',
        clientId: '#88392',
        email: 'demo@example.com'
      });
    }
    setIsLoggedIn(true);
    
    // If there was a pending service booking, restore it instead of going to dashboard
    if (pendingService) {
      setSelectedService(pendingService);
      setPendingService(null);
      // Stay on current page (likely home) so modal is visible
    } else {
      setCurrentPage('dashboard');
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
        onRegisterClick={() => setIsRegistrationOpen(true)} 
        onLoginClick={handleLogin}
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
            <div className="flex items-center gap-2 mb-6">
              <span className="font-serif text-2xl font-bold text-white tracking-tight">O.G. Agidi & Co</span>
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
              <li><button onClick={() => setIsLoggedIn(true)} className="hover:text-white transition-colors">Client Login</button></li>
              <li><button onClick={() => setIsRegistrationOpen(true)} className="hover:text-white transition-colors">Register Account</button></li>
              <li><button onClick={() => setIsLoggedIn(true)} className="hover:text-white transition-colors">Secure Upload</button></li>
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
          <p>&copy; {new Date().getFullYear()} O.G. Agidi & Co. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => setCurrentPage('terms-of-service')} className="hover:text-white transition-colors">Terms of Service</button>
            <button className="hover:text-white transition-colors">Privacy Policy</button>
          </div>
        </div>
      </footer>

      {selectedService && (
        <BookingModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
          isLoggedIn={isLoggedIn}
          onLoginRequired={() => {
            setPendingService(selectedService);
            setSelectedService(null);
            setIsRegistrationOpen(true);
          }}
        />
      )}

      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
        onSuccess={handleLogin}
      />
    </div>
  );
}
