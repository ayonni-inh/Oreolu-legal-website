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
          <div className="w-14 h-9 flex items-center justify-center shrink-0" aria-hidden="true">
            <svg viewBox="0 0 100 55" className="w-14 h-9" fill="#0a1628" xmlns="http://www.w3.org/2000/svg">
              <path d="M52,25 C45,19 35,13 20,9 C13,7 6,8 2,11 C9,12 19,13 30,17 C41,21 48,23 52,25Z"/>
              <path d="M52,30 C44,36 32,43 18,47 C11,49 4,48 2,44 C9,43 19,42 30,40 C41,37 48,33 52,30Z"/>
              <path d="M60,24 C67,18 77,12 90,9 C96,7 100,9 99,13 C93,14 85,14 77,17 C69,20 63,22 60,24Z"/>
              <path d="M60,30 C67,36 77,42 90,46 C96,48 100,46 99,43 C93,41 85,40 77,38 C69,36 63,33 60,30Z"/>
              <ellipse cx="56" cy="27" rx="9" ry="5"/>
              <path d="M63,23 C67,20 72,19 76,21 C72,23 67,24 63,27Z"/>
              <circle cx="77" cy="21" r="7"/>
              <path d="M83,18 C89,17 93,19 91,23 C89,25 85,24 83,21Z"/>
              <circle cx="79" cy="19" r="1.8" fill="white"/>
              <path d="M46,25 C39,23 30,22 24,25 C30,28 39,29 46,30Z"/>
            </svg>
          </div>
          <div className="text-center leading-tight">
            <div className="font-bold text-navy text-sm md:text-base tracking-tight">OROELU GODWIN AGIDI</div>
            <div className="font-bold text-navy text-sm md:text-base tracking-tight">& CO</div>
          </div>
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
