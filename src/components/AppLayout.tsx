import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="px-6 pb-8">
        <Outlet />
      </main>
    </div>
  );
}
