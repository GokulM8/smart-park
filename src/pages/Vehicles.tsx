import { useState } from 'react';
import { useParkingStore, VehicleType } from '@/lib/parking-store';
import { Search, Plus, Car, Bike, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const typeIcons = { car: Car, bike: Bike, ev: Zap };

export default function Vehicles() {
  const { vehicles, addVehicle } = useParkingStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'car' as VehicleType, ownerName: '', contactNumber: '' });

  const filtered = vehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.vehicleNumber || !form.ownerName) {
      toast.error('Please fill all required fields');
      return;
    }
    addVehicle(form);
    toast.success('Vehicle registered successfully');
    setForm({ vehicleNumber: '', vehicleType: 'car', ownerName: '', contactNumber: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage registered vehicles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Register Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Vehicle</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Vehicle Number (e.g. KA-01-AB-1234)" value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} />
              <div className="flex gap-2">
                {(['car', 'bike', 'ev'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, vehicleType: t }))} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.vehicleType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {t === 'ev' ? 'EV' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <Input placeholder="Owner Name" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
              <Input placeholder="Contact Number" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle Number</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Owner</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(v => {
                const Icon = typeIcons[v.vehicleType];
                return (
                  <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium font-mono">{v.vehicleNumber}</td>
                    <td className="py-3 px-4"><span className="flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{v.vehicleType === 'ev' ? 'EV' : v.vehicleType.charAt(0).toUpperCase() + v.vehicleType.slice(1)}</span></td>
                    <td className="py-3 px-4">{v.ownerName}</td>
                    <td className="py-3 px-4">{v.contactNumber}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
