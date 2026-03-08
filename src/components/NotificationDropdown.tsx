import { useRef, useState, useEffect } from 'react';
import { Bell, Car, ArrowDownToLine, ArrowUpFromLine, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParkingStore } from '@/lib/parking-store';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { records, getVehicle, getSlot } = useParkingStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build notifications from recent records
  const notifications = records
    .slice()
    .sort((a, b) => {
      const timeA = a.exitTime ? new Date(a.exitTime).getTime() : new Date(a.entryTime).getTime();
      const timeB = b.exitTime ? new Date(b.exitTime).getTime() : new Date(b.entryTime).getTime();
      return timeB - timeA;
    })
    .slice(0, 10)
    .map(r => {
      const vehicle = getVehicle(r.vehicleId);
      const slot = getSlot(r.slotId);
      if (r.exitTime) {
        return {
          id: r.id + '-exit',
          type: 'exit' as const,
          title: `${vehicle?.vehicleNumber} checked out`,
          subtitle: `Slot ${slot?.number} freed · ₹${r.amount} collected`,
          time: new Date(r.exitTime),
          icon: ArrowUpFromLine,
          color: 'bg-warning/10 text-warning',
        };
      }
      return {
        id: r.id + '-entry',
        type: 'entry' as const,
        title: `${vehicle?.vehicleNumber} checked in`,
        subtitle: `Parked at slot ${slot?.number} · ${vehicle?.ownerName}`,
        time: new Date(r.entryTime),
        icon: ArrowDownToLine,
        color: 'bg-success/10 text-success',
      };
    });

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = Math.round((now - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-80 bg-card rounded-2xl border border-border shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-display font-semibold">Notifications</h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                {notifications.length} recent
              </span>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                    <n.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                    {formatTime(n.time)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
