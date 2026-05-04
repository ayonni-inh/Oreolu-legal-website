import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  user?: any;
  onRegisterClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ isLoggedIn, user, onRegisterClick, onLoginClick, onLogoutClick, onNavigate, currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', roles: ['All'] },
    { id: 'blog', label: 'Blog', roles: ['All'] },
    { id: 'legal-research', label: 'Legal Research', roles: ['All'] },
    { id: 'ai-center', label: 'AI Center', roles: ['Admin'] },
    { id: 'about-us', label: 'About Us', roles: ['All'] },
    { id: 'contact-us', label: 'Contact Us', roles: ['All'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes('All') || (isLoggedIn && user && item.roles.includes(user.appRole))
  );

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button 
          className="flex items-center gap-2 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-lg outline-none" 
          onClick={() => handleNavClick('home')}
          aria-label="OROELU GODWIN AGIDI & CO - Home"
        >
          <div className="w-10 h-10 flex items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 30 C8 26, 14 22, 20 24 L28 20 C32 16, 40 12, 50 10 C46 16, 42 20, 38 22 L44 20 C48 18, 54 17, 60 18 C55 23, 48 25, 42 24 L36 26 C44 28, 50 32, 52 38 C46 36, 40 32, 34 30 L30 32 C26 38, 20 44, 12 46 C14 40, 18 34, 24 30 L18 32 C12 34, 8 36, 4 34 Z"
                fill="#0a1628"
              />
              <path
                d="M36 26 C38 30, 38 35, 36 40 C34 36, 33 31, 36 26 Z"
                fill="#0a1628"
              />
              <circle cx="49" cy="13" r="2" fill="#0a1628" />
              <path
                d="M51 13 C54 12, 57 13, 59 15 C57 15, 55 15, 53 14 Z"
                fill="#0a1628"
              />
            </svg>
          </div>
          <span className="font-serif text-xl md:text-2xl font-bold text-navy tracking-tight whitespace-nowrap">AGIDI & CO</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {filteredNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={currentPage === item.id ? 'page' : undefined}
              className={`text-sm font-medium transition-colors focus-visible:text-gold outline-none ${
                currentPage === item.id ? 'text-navy font-bold underline underline-offset-4 decoration-gold decoration-2' : 'text-gray-600 hover:text-navy'
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
                className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded px-2 outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white overflow-hidden shadow-sm border border-gold/20">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </button>
              <button 
                onClick={onLogoutClick}
                className="bg-gray-100 hover:bg-gray-200 text-navy text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-gray-300 outline-none"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="bg-gold hover:bg-gold-hover text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 outline-none"
              >
                Login
              </button>
              <button 
                onClick={onRegisterClick}
                className="bg-navy hover:bg-navy-light text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 outline-none"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-navy p-2 focus-visible:ring-2 focus-visible:ring-navy rounded-lg outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-5 duration-200 z-50"
        >
          <nav className="flex flex-col p-6 space-y-4" aria-label="Mobile Navigation">
            {filteredNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
                className={`text-left text-lg font-medium py-2 border-b border-gray-100 focus-visible:text-gold outline-none ${
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
                    className="flex items-center gap-3 text-navy font-semibold py-2 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <span>My Account</span>
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
          </nav>
        </div>
      )}
    </header>
  );
}
