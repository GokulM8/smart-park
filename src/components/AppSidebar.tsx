import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ParkingSquare, ArrowRightLeft, Receipt, BarChart3, Settings, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/slots', icon: ParkingSquare, label: 'Parking Slots' },
  { to: '/entry-exit', icon: ArrowRightLeft, label: 'Entry / Exit' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin', icon: Settings, label: 'Admin Panel' },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-bg flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-hover">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ParkingSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-primary-foreground">ParkSmart</h1>
            <p className="text-xs text-sidebar-fg/60">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive ? 'bg-primary/15 text-primary' : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-primary-foreground'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-hover">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-foreground truncate">Admin User</p>
            <p className="text-xs text-sidebar-fg/60">Administrator</p>
          </div>
          <LogOut className="w-4 h-4 text-sidebar-fg/60 cursor-pointer hover:text-primary" />
        </div>
      </div>
    </aside>
  );
}
