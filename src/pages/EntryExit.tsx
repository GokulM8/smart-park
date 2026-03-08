import { useState } from 'react';
import { useParkingStore } from '@/lib/parking-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react';
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

      <div className="stat-card">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><ArrowDownToLine className="w-5 h-5 text-success" /> Vehicle Entry</h3>
        <div className="flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Enter vehicle number..." className="pl-10" value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />
          </div>
          <Button onClick={handleEntry} disabled={!matchedVehicle || !!isAlreadyParked}>
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Check In
          </Button>
        </div>
        {matchedVehicle && !isAlreadyParked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 rounded-lg bg-success/10 text-sm">
            <span className="font-medium">Found:</span> {matchedVehicle.ownerName} — {matchedVehicle.vehicleType.toUpperCase()} — {availableSlots.length} slots available
          </motion.div>
        )}
        {matchedVehicle && isAlreadyParked && (
          <p className="mt-3 text-sm text-warning">This vehicle is already parked.</p>
        )}
      </div>

      <div className="stat-card">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><ArrowUpFromLine className="w-5 h-5 text-warning" /> Active Parking Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Owner</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Slot</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Entry</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRecords.map(r => {
                const v = getVehicle(r.vehicleId);
                const s = getSlot(r.slotId);
                const dur = Math.round((Date.now() - new Date(r.entryTime).getTime()) / 60000);
                return (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">{v?.vehicleNumber}</td>
                    <td className="py-3 px-4">{v?.ownerName}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{s?.number}</span></td>
                    <td className="py-3 px-4">{new Date(r.entryTime).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">{Math.floor(dur / 60)}h {dur % 60}m</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" onClick={() => handleExit(r.id)}>
                        <ArrowUpFromLine className="w-3 h-3 mr-1" /> Exit
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {activeRecords.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No active parking sessions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
