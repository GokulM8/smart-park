import { useState } from 'react';
import { useParkingStore } from '@/lib/parking-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, ArrowUpFromLine, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EntryExit() {
  const { vehicles, slots, records, vehicleEntry, vehicleExit, getVehicle, getSlot } = useParkingStore();
  const [vehicleSearch, setVehicleSearch] = useState('');

  const activeRecords = records.filter(r => !r.exitTime);
  const matchedVehicle = vehicles.find(v => v.vehicleNumber.toLowerCase() === vehicleSearch.toLowerCase());
  const isAlreadyParked = matchedVehicle && activeRecords.some(r => r.vehicleId === matchedVehicle.id);
  const availableSlots = matchedVehicle ? slots.filter(s => s.status === 'available' && s.type === matchedVehicle.vehicleType) : [];

  const handleEntry = () => {
    if (!matchedVehicle) { toast.error('Vehicle not found. Register it first.'); return; }
    if (isAlreadyParked) { toast.error('Vehicle is already parked.'); return; }
    if (availableSlots.length === 0) { toast.error('No available slots for this vehicle type.'); return; }
    const slot = availableSlots[0];
    vehicleEntry(matchedVehicle.id, slot.id);
    toast.success(`Vehicle ${matchedVehicle.vehicleNumber} parked at slot ${slot.number}`);
    setVehicleSearch('');
  };

  const handleExit = (recordId: string) => {
    const result = vehicleExit(recordId);
    const vehicle = getVehicle(result.vehicleId);
    toast.success(`Vehicle ${vehicle?.vehicleNumber} exited. Bill: ₹${result.amount}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Entry & Exit</h1>
        <p className="text-muted-foreground mt-1">Manage vehicle check-in and check-out</p>
      </div>

      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center"><ArrowDownToLine className="w-4 h-4 text-success" /></span>
          Vehicle Entry
        </h3>
        <div className="flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Enter vehicle number..." className="pl-10 rounded-xl" value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />
          </div>
          <Button className="rounded-xl" onClick={handleEntry} disabled={!matchedVehicle || !!isAlreadyParked}>
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Check In
          </Button>
        </div>
        {matchedVehicle && !isAlreadyParked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3.5 rounded-xl bg-success/10 text-sm">
            <span className="font-semibold">Found:</span> {matchedVehicle.ownerName} — {matchedVehicle.vehicleType.toUpperCase()} — {availableSlots.length} slots available
          </motion.div>
        )}
        {matchedVehicle && isAlreadyParked && (
          <p className="mt-3 text-sm text-warning font-medium">This vehicle is already parked.</p>
        )}
      </div>

      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-warning/15 flex items-center justify-center"><ArrowUpFromLine className="w-4 h-4 text-warning" /></span>
          Active Parking Sessions
        </h3>
        <div className="space-y-3">
          {activeRecords.map(r => {
            const v = getVehicle(r.vehicleId);
            const s = getSlot(r.slotId);
            const dur = Math.round((Date.now() - new Date(r.entryTime).getTime()) / 60000);
            return (
              <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-sm font-bold text-lavender-foreground">
                  {v?.ownerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{v?.ownerName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v?.vehicleNumber}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{s?.number}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {Math.floor(dur / 60)}h {dur % 60}m
                </span>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => handleExit(r.id)}>
                  <ArrowUpFromLine className="w-3 h-3 mr-1" /> Exit
                </Button>
              </div>
            );
          })}
          {activeRecords.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No active parking sessions</div>
          )}
        </div>
      </div>
    </div>
  );
}
