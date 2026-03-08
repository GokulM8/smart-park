import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="px-4 sm:px-6 pb-24 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}