import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ParkingSquare, Search, Moon, Sun, Settings, Users, BarChart3, LogOut, Shield, ChevronDown, Menu } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchDialog from './SearchDialog';
import NotificationDropdown from './NotificationDropdown';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { useAuthStore } from '@/lib/auth-store';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/slots', label: 'Slots' },
  { to: '/entry-exit', label: 'Entry/Exit' },
  { to: '/billing', label: 'Billing' },
  { to: '/reports', label: 'Reports' },
];

const adminMenuItems = [
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
  { to: '/reports', icon: BarChart3, label: 'System Reports' },
  { to: '/vehicles', icon: Users, label: 'Manage Staff' },
  { to: '/slots', icon: Settings, label: 'Slot Settings' },
];

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className="glass-surface !rounded-2xl !p-3 mx-4 sm:mx-6 mt-4 mb-6 flex items-center justify-between sticky top-4 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mr-1">
            <ParkingSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-display font-bold mr-2 lg:mr-6">ParkSmart</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setDark(d => !d)}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setSearchOpen(true)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <SearchDialog open={searchOpen} onClose={() => setSearchOpen(o => !o)} />
          <NotificationDropdown />

          {/* Profile dropdown — hidden on mobile */}
          <div className="relative ml-2 pl-3 border-l border-border hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold leading-tight">Angie D</p>
                <p className="text-xs text-muted-foreground">admin@park.io</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
                A
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Angie D</p>
                        <p className="text-xs text-muted-foreground">admin@park.io</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                          <Shield className="w-2.5 h-2.5" /> Administrator
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Settings</p>
                    {adminMenuItems.map(item => (
                      <button
                        key={item.label}
                        onClick={() => { navigate(item.to); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sheet menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-card">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Profile header */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
                A
              </div>
              <div>
                <p className="text-sm font-semibold">Angie D</p>
                <p className="text-xs text-muted-foreground">admin@park.io</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold">
                  <Shield className="w-2.5 h-2.5" /> Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Admin section */}
          <div className="p-3 border-t border-border">
            <p className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Settings</p>
            {adminMenuItems.map(item => (
              <button
                key={item.label}
                onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Sign out */}
          <div className="p-3 border-t border-border mt-auto">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
