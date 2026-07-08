import { Menu, X, User, ChevronRight, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const navItems = [
    { id: 'home', label: 'Home', roles: ['All'] },
    { id: 'blog', label: 'Blog', roles: ['All'] },
    { id: 'legal-research', label: 'Legal Research', roles: ['All'] },
    { id: 'admin-dashboard', label: 'Management', roles: ['Admin'] },
    { id: 'ai-center', label: 'AI Center', roles: ['Admin'] },
    { id: 'staff-portal', label: 'Staff Portal', roles: ['Staff'] },
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
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            className="flex items-center gap-2.5 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-lg outline-none group"
            onClick={() => handleNavClick('home')}
            aria-label="OROELU GODWIN AGIDI & CO - Home"
          >
            <img
              src="/eagle-logo-transparent.png"
              alt=""
              className="w-10 h-10 md:w-14 md:h-14 object-contain shrink-0 group-hover:opacity-80 transition-opacity"
              style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(60%) saturate(800%) hue-rotate(190deg) brightness(85%)' }}
            />
            <div className="leading-tight text-left">
              <div className="font-bold text-navy text-[11px] md:text-sm tracking-tight">OROELU GODWIN</div>
              <div className="font-bold text-navy text-[11px] md:text-sm tracking-tight">AGIDI &amp; CO</div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center" aria-label="Main Navigation">
            {filteredNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
                className={`relative text-sm font-medium transition-colors focus-visible:text-gold outline-none pb-1 group ${
                  currentPage === item.id ? 'text-navy font-bold' : 'text-gray-500 hover:text-navy'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-all duration-200 ${
                  currentPage === item.id ? 'bg-gold opacity-100' : 'bg-gold opacity-0 group-hover:opacity-40'
                }`} />
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold transition-colors rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white overflow-hidden shadow-sm border-2 border-gold/30">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                    )}
                  </div>
                  <span className="text-sm text-navy font-medium hidden lg:block">{user?.firstName}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-navy dark:text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate(user?.appRole === 'Admin' ? 'admin-dashboard' : user?.appRole === 'Staff' ? 'staff-portal' : 'dashboard'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                      onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('profile?tab=preferences'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4" /> Settings & Preferences
                    </button>
                    <div className="border-t border-gray-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => { onLogoutClick?.(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="text-sm font-semibold text-navy border border-navy/20 hover:border-navy px-5 py-2.5 rounded-lg transition-all hover:bg-navy/5"
                >
                  Login
                </button>
                <button
                  onClick={onRegisterClick}
                  className="text-sm font-semibold bg-navy hover:bg-navy-light text-white px-5 py-2.5 rounded-lg transition-all shadow-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile: Auth shortcut + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('profile')}
                className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white border-2 border-gold/30"
                aria-label="Profile"
              >
                <span className="text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="text-xs font-bold text-navy border border-navy/20 px-3 py-1.5 rounded-lg"
              >
                Login
              </button>
            )}
            <button
              className="text-navy p-2 focus-visible:ring-2 focus-visible:ring-navy rounded-lg outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Gold accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </header>

      {/* Mobile Menu — Full overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-[calc(4rem+2px)] z-30 bg-navy/95 backdrop-blur-md flex flex-col"
        >
          {/* Firm branding inside menu */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <img
              src="/eagle-logo-transparent.png"
              alt=""
              className="w-10 h-10 object-contain brightness-0 invert opacity-80"
            />
            <div className="leading-tight">
              <div className="font-bold text-white text-sm tracking-tight">OROELU GODWIN</div>
              <div className="font-bold text-gold text-sm tracking-tight">AGIDI &amp; CO</div>
            </div>
          </div>

          <nav className="flex flex-col px-6 py-4 space-y-1 flex-1" aria-label="Mobile Navigation">
            {filteredNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
                className={`flex items-center justify-between text-left text-base font-semibold py-3.5 px-4 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-gold/20 text-gold'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ))}
          </nav>

          <div className="px-6 py-6 border-t border-white/10 space-y-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl mb-2">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                    <p className="text-white/50 text-xs">{user?.appRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onNavigate(user?.appRole === 'Admin' ? 'admin-dashboard' : user?.appRole === 'Staff' ? 'staff-portal' : 'dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gold text-white font-bold py-3.5 rounded-xl text-sm"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }}
                  className="w-full bg-white/10 text-white font-semibold py-3.5 rounded-xl text-sm"
                >
                  Profile
                </button>
                <button
                  onClick={() => { onNavigate('profile?tab=preferences'); setIsMobileMenuOpen(false); }}
                  className="w-full bg-white/10 text-white font-semibold py-3.5 rounded-xl text-sm"
                >
                  Settings & Preferences
                </button>
                <button
                  onClick={() => { onLogoutClick?.(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-white/10 text-white font-semibold py-3.5 rounded-xl text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onLoginClick?.(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gold text-white font-bold py-3.5 rounded-xl text-sm shadow-lg"
                >
                  Login to Portal
                </button>
                <button
                  onClick={() => { onRegisterClick?.(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-white/10 text-white font-semibold py-3.5 rounded-xl text-sm border border-white/20"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
