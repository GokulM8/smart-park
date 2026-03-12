import { useState, useEffect } from 'react';
import { useParkingStore, VehicleType } from '@/lib/parking-store';
import { Search, Plus, Car, Bike, Zap, History, Clock, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const typeIcons = { car: Car, bike: Bike, ev: Zap };
const typeBg = { car: 'bg-lavender text-lavender-foreground', bike: 'bg-ice text-ice-foreground', ev: 'bg-peach text-peach-foreground' };

export default function Vehicles() {
  const { vehicles, records, addVehicle, getVehicleHistory, getSlot, initialize } = useParkingStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [historyVehicleId, setHistoryVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'car' as VehicleType, ownerName: '', contactNumber: '' });

  useEffect(() => { initialize(); }, [initialize]);

  const filtered = vehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.vehicleNumber || !form.ownerName) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await addVehicle(form);
      toast.success('Vehicle registered successfully');
      setForm({ vehicleNumber: '', vehicleType: 'car', ownerName: '', contactNumber: '' });
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[addVehicle]', err);
      toast.error(`Failed to register vehicle: ${msg}`);
    }
  };

  const historyVehicle = historyVehicleId ? vehicles.find(v => v.id === historyVehicleId) : null;
  const history = historyVehicleId ? getVehicleHistory(historyVehicleId) : [];
  const activeRecord = historyVehicleId ? records.find(r => r.vehicleId === historyVehicleId && !r.exitTime) : null;
  const totalSpend = history.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalVisits = history.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage registered vehicles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> Register Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Register New Vehicle</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input className="rounded-xl" placeholder="Vehicle Number (e.g. KA-01-AB-1234)" value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
              <div className="flex gap-2">
                {(['car', 'bike', 'ev'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, vehicleType: t }))} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.vehicleType === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
                    {t === 'ev' ? 'EV' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <Input className="rounded-xl" placeholder="Owner Name" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
              <Input className="rounded-xl" placeholder="Contact Number" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
              <Button className="w-full rounded-xl" onClick={handleAdd}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." className="pl-10 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card !p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-5 text-muted-foreground font-medium">Vehicle Number</th>
              <th className="text-left py-4 px-5 text-muted-foreground font-medium">Type</th>
              <th className="text-left py-4 px-5 text-muted-foreground font-medium hidden sm:table-cell">Owner</th>
              <th className="text-left py-4 px-5 text-muted-foreground font-medium hidden md:table-cell">Contact</th>
              <th className="text-left py-4 px-5 text-muted-foreground font-medium">History</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(v => {
                const Icon = typeIcons[v.vehicleType];
                const vHistory = records.filter(r => r.vehicleId === v.id && r.exitTime);
                return (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold font-mono text-xs sm:text-sm">{v.vehicleNumber}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${typeBg[v.vehicleType]}`}>
                        <Icon className="w-3.5 h-3.5" />{v.vehicleType === 'ev' ? 'EV' : v.vehicleType.charAt(0).toUpperCase() + v.vehicleType.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 hidden sm:table-cell">{v.ownerName}</td>
                    <td className="py-3.5 px-5 text-muted-foreground hidden md:table-cell">{v.contactNumber}</td>
                    <td className="py-3.5 px-5">
                      <Button size="sm" variant="ghost" className="rounded-xl gap-1.5" onClick={() => setHistoryVehicleId(v.id)}>
                        <History className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{vHistory.length} visits</span>
                        <span className="sm:hidden">{vHistory.length}</span>
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Vehicle History Dialog */}
      <Dialog open={!!historyVehicleId} onOpenChange={(o) => { if (!o) setHistoryVehicleId(null); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
          {historyVehicle && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeBg[historyVehicle.vehicleType]}`}>
                      {(() => { const I = typeIcons[historyVehicle.vehicleType]; return <I className="w-5 h-5" />; })()}
                    </div>
                    <div>
                      <p className="font-mono text-base">{historyVehicle.vehicleNumber}</p>
                      <p className="text-sm font-normal text-muted-foreground">{historyVehicle.ownerName}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="sr-only">Parking history for {historyVehicle.vehicleNumber}</DialogDescription>
                </DialogHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-card/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Visits</p>
                    <p className="text-lg font-bold mt-0.5">{totalVisits}</p>
                  </div>
                  <div className="bg-card/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-bold mt-0.5">₹{totalSpend}</p>
                  </div>
                  <div className="bg-card/60 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className={`text-sm font-bold mt-1 ${activeRecord ? 'text-success' : 'text-muted-foreground'}`}>
                      {activeRecord ? 'Parked' : 'Not Here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* History list */}
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {history.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm">No parking history yet</div>
                )}
                {history.map((r, i) => {
                  const slot = getSlot(r.slotId);
                  const hrs = Math.floor((r.duration || 0) / 60);
                  const mins = (r.duration || 0) % 60;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {slot?.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.exitTime ? new Date(r.exitTime).toLocaleDateString() : '—'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {hrs}h {mins}m
                        </p>
                      </div>
                      <span className="text-sm font-bold flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />{r.amount}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}