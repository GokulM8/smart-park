import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ParkingSquare, ArrowRightLeft, Receipt, BarChart3 } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/slots', icon: ParkingSquare, label: 'Slots' },
  { to: '/entry-exit', icon: ArrowRightLeft, label: 'Entry' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-0 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
              <span className="text-[10px] font-medium leading-tight truncate">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}