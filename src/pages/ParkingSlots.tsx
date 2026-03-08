import { useParkingStore } from '@/lib/parking-store';
import { Car, Bike, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const typeIcons = { car: Car, bike: Bike, ev: Zap };
const typeLabels = { car: 'Car', bike: 'Bike', ev: 'EV' };

export default function ParkingSlots() {
  const { slots } = useParkingStore();
  const [filter, setFilter] = useState<'all' | 'car' | 'bike' | 'ev'>('all');
  const [floorFilter, setFloorFilter] = useState<number>(0);

  const filtered = slots.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false;
    if (floorFilter > 0 && s.floor !== floorFilter) return false;
    return true;
  });

  const floors = [...new Set(slots.map(s => s.floor))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Parking Slots</h1>
        <p className="text-muted-foreground mt-1">Visual slot layout and availability</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {(['all', 'car', 'bike', 'ev'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t === 'all' ? 'All Types' : typeLabels[t]}
          </button>
        ))}
        <div className="border-l border-border mx-2" />
        <button
          onClick={() => setFloorFilter(0)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${floorFilter === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          All Floors
        </button>
        {floors.map((f: number) => (
          <button
            key={f}
            onClick={() => setFloorFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${floorFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Floor {f}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-muted border border-border" /> Available ({filtered.filter(s => s.status === 'available').length})</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-destructive/10 border border-destructive/30" /> Occupied ({filtered.filter(s => s.status === 'occupied').length})</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {filtered.map((slot, i) => {
          const Icon = typeIcons[slot.type];
          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`parking-slot ${slot.status === 'available' ? 'parking-slot-available' : 'parking-slot-occupied'}`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${slot.status === 'available' ? 'text-muted-foreground' : 'text-destructive'}`} />
              <p className="text-xs font-semibold">{slot.number}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{slot.type}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
