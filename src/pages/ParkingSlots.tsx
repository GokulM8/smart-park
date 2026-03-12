import { useParkingStore, VehicleType } from '@/lib/parking-store';
import { Car, Bike, Zap, Plus, Trash2, Ban, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const typeIcons = { car: Car, bike: Bike, ev: Zap };
const typeLabels = { car: 'Car', bike: 'Bike', ev: 'EV' };
const typeColors = {
  car: { bg: 'bg-lavender', text: 'text-lavender-foreground', border: 'border-lavender' },
  bike: { bg: 'bg-ice', text: 'text-ice-foreground', border: 'border-ice' },
  ev: { bg: 'bg-peach', text: 'text-peach-foreground', border: 'border-peach' },
};

export default function ParkingSlots() {
  const { slots, addSlot, removeSlot, toggleSlotDisabled, initialize } = useParkingStore();
  const [filter, setFilter] = useState<'all' | 'car' | 'bike' | 'ev'>('all');
  const [floorFilter, setFloorFilter] = useState<number>(0);
  const [addOpen, setAddOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ number: '', type: 'car' as VehicleType, floor: 1 });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => { initialize(); }, [initialize]);

  const filtered = slots.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false;
    if (floorFilter > 0 && s.floor !== floorFilter) return false;
    return true;
  });

  const floors = [...new Set(slots.map(s => s.floor))].sort();
  const selectedSlot = selectedSlotId ? slots.find(s => s.id === selectedSlotId) : null;

  const handleAddSlot = async () => {
    if (!newSlot.number.trim()) { toast.error('Enter a slot number'); return; }
    if (slots.some(s => s.number === newSlot.number.trim())) { toast.error('Slot number already exists'); return; }
    try {
      await addSlot({ number: newSlot.number.trim(), type: newSlot.type, floor: newSlot.floor });
      toast.success(`Slot ${newSlot.number} added`);
      setNewSlot({ number: '', type: 'car', floor: 1 });
      setAddOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add slot';
      toast.error(message);
    }
  };

  const handleRemove = async () => {
    if (!selectedSlotId) return;
    try {
      const success = await removeSlot(selectedSlotId);
      if (success) {
        toast.success(`Slot ${selectedSlot?.number} removed`);
        setSelectedSlotId(null);
      } else {
        toast.error('Cannot remove — slot has an active session');
      }
    } catch {
      toast.error('Failed to remove slot');
    }
  };

  const handleToggleDisable = async () => {
    if (!selectedSlotId) return;
    try {
      const slot = slots.find(s => s.id === selectedSlotId);
      await toggleSlotDisabled(selectedSlotId);
      toast.success(`Slot ${slot?.number} ${slot?.status === 'disabled' ? 'enabled' : 'disabled'}`);
      setSelectedSlotId(null);
    } catch {
      toast.error('Failed to update slot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Parking Slots</h1>
          <p className="text-muted-foreground mt-1">Manage slot layout and availability</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> Add Slot</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Slot</DialogTitle>
              <DialogDescription>Create a new parking slot</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input className="rounded-xl" placeholder="Slot Number (e.g. 3C01)" value={newSlot.number} onChange={e => setNewSlot(f => ({ ...f, number: e.target.value }))} />
              <div>
                <p className="text-sm font-medium mb-2">Vehicle Type</p>
                <div className="flex gap-2">
                  {(['car', 'bike', 'ev'] as const).map(t => (
                    <button key={t} onClick={() => setNewSlot(f => ({ ...f, type: t }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${newSlot.type === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
                      {(() => { const I = typeIcons[t]; return <I className="w-4 h-4" />; })()}
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Floor</p>
                <div className="flex gap-2">
                  {[1, 2, 3].map(f => (
                    <button key={f} onClick={() => setNewSlot(prev => ({ ...prev, floor: f }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${newSlot.floor === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
                      Floor {f}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full rounded-xl" onClick={handleAddSlot}>Add Slot</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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
        {floors.map(f => (
          <button
            key={f}
            onClick={() => setFloorFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${floorFilter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            Floor {f}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-lg bg-lavender" /> Available ({filtered.filter(s => s.status === 'available').length})</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-lg bg-peach" /> Occupied ({filtered.filter(s => s.status === 'occupied').length})</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-lg bg-muted border border-border" /> Disabled ({filtered.filter(s => s.status === 'disabled').length})</span>
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        <AnimatePresence>
          {filtered.map((slot, i) => {
            const Icon = typeIcons[slot.type];
            const colors = typeColors[slot.type];
            const isSelected = selectedSlotId === slot.id;
            return (
              <motion.div
                key={slot.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                className={`rounded-2xl border-2 p-3.5 text-center transition-all duration-200 cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                } ${
                  slot.status === 'disabled'
                    ? 'bg-muted/30 border-border opacity-50'
                    : slot.status === 'available'
                      ? `${colors.bg}/40 ${colors.border}/40 hover:shadow-md`
                      : 'bg-peach/50 border-peach/60'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1.5 ${
                  slot.status === 'disabled' ? 'text-muted-foreground' :
                  slot.status === 'available' ? colors.text : 'text-peach-foreground'
                }`} />
                <p className="text-xs font-bold">{slot.number}</p>
                <p className={`text-[10px] mt-0.5 ${slot.status === 'disabled' ? 'text-destructive font-semibold' : 'text-muted-foreground capitalize'}`}>
                  {slot.status === 'disabled' ? 'Disabled' : slot.type}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Slot action bar */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 max-w-md w-[calc(100%-2rem)]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(() => { const I = typeIcons[selectedSlot.type]; return <I className="w-5 h-5 text-primary shrink-0" />; })()}
              <div className="min-w-0">
                <p className="text-sm font-bold">Slot {selectedSlot.number}</p>
                <p className="text-xs text-muted-foreground capitalize">{selectedSlot.type} · Floor {selectedSlot.floor} · {selectedSlot.status}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedSlot.status !== 'occupied' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleToggleDisable}
                >
                  {selectedSlot.status === 'disabled' ? (
                    <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Enable</>
                  ) : (
                    <><Ban className="w-3.5 h-3.5 mr-1" /> Disable</>
                  )}
                </Button>
              )}
              {selectedSlot.status !== 'occupied' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              )}
              {selectedSlot.status === 'occupied' && (
                <span className="text-xs text-muted-foreground px-2 py-1">In use — cannot modify</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}