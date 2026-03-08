import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ParkingSquare, ArrowRightLeft, Receipt, BarChart3, Settings, Search, Bell, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/slots', label: 'Slots' },
  { to: '/entry-exit', label: 'Entry/Exit' },
  { to: '/billing', label: 'Billing' },
  { to: '/reports', label: 'Reports' },
];

export default function TopNavbar() {
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="glass-surface !rounded-2xl !p-3 mx-6 mt-4 mb-6 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mr-1">
          <ParkingSquare className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-display font-bold mr-6">ParkSmart</span>
      </div>

      <nav className="flex items-center gap-1">
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

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDark(d => !d)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
        </button>
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-semibold leading-tight">Angie D</p>
            <p className="text-xs text-muted-foreground">admin@park.io</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
