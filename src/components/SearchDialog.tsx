import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Car, ParkingSquare, ArrowRightLeft, Receipt, BarChart3, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParkingStore } from '@/lib/parking-store';

const pages = [
  { label: 'Dashboard', to: '/', icon: ParkingSquare },
  { label: 'Vehicles', to: '/vehicles', icon: Car },
  { label: 'Parking Slots', to: '/slots', icon: ParkingSquare },
  { label: 'Entry / Exit', to: '/entry-exit', icon: ArrowRightLeft },
  { label: 'Billing', to: '/billing', icon: Receipt },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Admin Panel', to: '/admin', icon: Settings },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { vehicles } = useParkingStore();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.toLowerCase();

  const matchedPages = pages.filter(p => p.label.toLowerCase().includes(q));
  const matchedVehicles = query.length >= 2
    ? vehicles.filter(v =>
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const handleNavigate = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[10%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-card rounded-2xl border border-border shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, vehicles..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {matchedPages.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages</p>
                  {matchedPages.map(p => (
                    <button
                      key={p.to}
                      onClick={() => handleNavigate(p.to)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <p.icon className="w-4 h-4 text-muted-foreground" />
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {matchedVehicles.length > 0 && (
                <div className="mt-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vehicles</p>
                  {matchedVehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleNavigate('/vehicles')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
                    >
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium font-mono text-xs">{v.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">{v.ownerName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchedPages.length === 0 && matchedVehicles.length === 0 && query.length > 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
