import { Scale, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ isLoggedIn, onRegisterClick, onLoginClick, onLogoutClick, onNavigate, currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'legal-research', label: 'Legal Research' },
    { id: 'about-us', label: 'About Us' },
    { id: 'contact-us', label: 'Contact Us' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0" 
          onClick={() => handleNavClick('home')}
        >
          <div className="w-10 h-10 bg-navy rounded flex items-center justify-center">
            <Scale className="text-gold w-6 h-6" />
          </div>
          <span className="font-serif text-xl md:text-2xl font-bold text-navy tracking-tight whitespace-nowrap">O.G. Agidi & Co</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-sm font-medium transition-colors ${
                currentPage === item.id ? 'text-navy font-bold' : 'text-gray-600 hover:text-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-sm font-semibold text-navy hover:text-gold transition-colors"
              >
                My Account
              </button>
              <button 
                onClick={onLogoutClick}
                className="bg-gray-100 hover:bg-gray-200 text-navy text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="bg-gold hover:bg-gold-hover text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                Login
              </button>
              <button 
                onClick={onRegisterClick}
                className="bg-navy hover:bg-navy-light text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-navy p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-5 duration-200 z-50">
          <div className="flex flex-col p-6 space-y-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left text-lg font-medium py-2 border-b border-gray-100 ${
                  currentPage === item.id ? 'text-navy font-bold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-4 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }}
                    className="text-navy font-semibold py-2 text-left"
                  >
                    My Account
                  </button>
                  <button 
                    onClick={() => { onLogoutClick?.(); setIsMobileMenuOpen(false); }}
                    className="bg-gray-100 text-navy font-semibold py-3 rounded-lg text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { onLoginClick?.(); setIsMobileMenuOpen(false); }}
                    className="bg-gold text-white font-semibold py-3 rounded-lg text-center"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { onRegisterClick?.(); setIsMobileMenuOpen(false); }}
                    className="bg-navy text-white font-semibold py-3 rounded-lg text-center"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
