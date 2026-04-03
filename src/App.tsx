import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useAuthStore } from "./lib/supabase-auth-store";
import { SUPABASE_CONFIG_ERROR } from "./lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import LoadingGrid from "./components/LoadingGrid";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const ParkingSlots = lazy(() => import("./pages/ParkingSlots"));
const EntryExit = lazy(() => import("./pages/EntryExit"));
const Billing = lazy(() => import("./pages/Billing"));
const Reports = lazy(() => import("./pages/Reports"));
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="p-6">
      <LoadingGrid count={6} columns={3} />
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!user) return <AuthPage />;
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    {SUPABASE_CONFIG_ERROR ? (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-xl font-semibold mb-3">Supabase setup required</h1>
          <p className="text-sm text-muted-foreground mb-4">{SUPABASE_CONFIG_ERROR}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
            <li>Create or update <span className="font-mono">.env.local</span> in the project root.</li>
            <li>Add <span className="font-mono">VITE_SUPABASE_URL</span> and <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>.</li>
            <li>Restart the dev server.</li>
          </ol>
        </div>
      </div>
    ) : (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGate>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/slots" element={<ParkingSlots />} />
                  <Route path="/entry-exit" element={<EntryExit />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthGate>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    )}
  </ErrorBoundary>
);

export default App;