import { useParkingStore } from '@/lib/parking-store';
import { Car, Bike, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const typeIcons = { car: Car, bike: Bike, ev: Zap };
const typeLabels = { car: 'Car', bike: 'Bike', ev: 'EV' };
const typeColors = {
  car: { bg: 'bg-lavender', text: 'text-lavender-foreground', border: 'border-lavender' },
  bike: { bg: 'bg-ice', text: 'text-ice-foreground', border: 'border-ice' },
  ev: { bg: 'bg-peach', text: 'text-peach-foreground', border: 'border-peach' },
};

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

      <div className="flex flex-wrap gap-2">
        {(['all', 'car', 'bike', 'ev'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t === 'all' ? 'All Types' : typeLabels[t]}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        <button
          onClick={() => setFloorFilter(0)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${floorFilter === 0 ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          All Floors
        </button>
        {floors.map((f: number) => (
          <button
            key={f}
            onClick={() => setFloorFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${floorFilter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Floor {f}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-lg bg-lavender" /> Available ({filtered.filter(s => s.status === 'available').length})</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-lg bg-peach" /> Occupied ({filtered.filter(s => s.status === 'occupied').length})</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {filtered.map((slot, i) => {
          const Icon = typeIcons[slot.type];
          const colors = typeColors[slot.type];
          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              className={`rounded-2xl border-2 p-3.5 text-center transition-all duration-200 cursor-pointer ${
                slot.status === 'available'
                  ? `${colors.bg}/40 ${colors.border}/40 hover:${colors.border} hover:shadow-md`
                  : `bg-peach/50 border-peach/60`
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${slot.status === 'available' ? colors.text : 'text-peach-foreground'}`} />
              <p className="text-xs font-bold">{slot.number}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{slot.type}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
