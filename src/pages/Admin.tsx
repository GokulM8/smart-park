import { useState } from 'react';
import { useParkingStore, VehicleType } from '@/lib/parking-store';
import { Settings, Users, ParkingSquare, Activity, Car, Bike, Zap, IndianRupee, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatCard from '@/components/StatCard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const rateConfig: { type: VehicleType; label: string; icon: typeof Car; bg: string; text: string }[] = [
  { type: 'car', label: 'Car', icon: Car, bg: 'bg-lavender', text: 'text-lavender-foreground' },
  { type: 'bike', label: 'Bike', icon: Bike, bg: 'bg-ice', text: 'text-ice-foreground' },
  { type: 'ev', label: 'EV', icon: Zap, bg: 'bg-peach', text: 'text-peach-foreground' },
];

export default function Admin() {
  const { slots, vehicles, records, rates, setRate } = useParkingStore();
  const activeRecords = records.filter(r => !r.exitTime);
  const [editRates, setEditRates] = useState(rates);

  const slotConfig = [
    { type: 'Car', icon: Car, count: slots.filter(s => s.type === 'car').length, occupied: slots.filter(s => s.type === 'car' && s.status === 'occupied').length, bg: 'bg-lavender', text: 'text-lavender-foreground' },
    { type: 'Bike', icon: Bike, count: slots.filter(s => s.type === 'bike').length, occupied: slots.filter(s => s.type === 'bike' && s.status === 'occupied').length, bg: 'bg-ice', text: 'text-ice-foreground' },
    { type: 'EV', icon: Zap, count: slots.filter(s => s.type === 'ev').length, occupied: slots.filter(s => s.type === 'ev' && s.status === 'occupied').length, bg: 'bg-peach', text: 'text-peach-foreground' },
  ];

  const handleSaveRates = () => {
    for (const rc of rateConfig) {
      const val = editRates[rc.type];
      if (val <= 0 || isNaN(val)) {
        toast.error(`Invalid rate for ${rc.label}`);
        return;
      }
      setRate(rc.type, val);
    }
    toast.success('Rates updated successfully!');
  };

  const hasChanges = rateConfig.some(rc => editRates[rc.type] !== rates[rc.type]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">System configuration and monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Slots" value={slots.length} icon={ParkingSquare} color="lavender" />
        <StatCard title="Registered Vehicles" value={vehicles.length} icon={Users} color="ice" />
        <StatCard title="Active Sessions" value={activeRecords.length} icon={Activity} color="peach" />
        <StatCard title="Total Transactions" value={records.filter(r => r.exitTime).length} icon={Settings} color="primary" />
      </div>

      {/* Rate Configuration */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              Rate Configuration
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">Set hourly parking rates per vehicle type</p>
          </div>
          <Button
            className="rounded-xl"
            size="sm"
            onClick={handleSaveRates}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Rates
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rateConfig.map(rc => (
            <motion.div
              key={rc.type}
              whileHover={{ scale: 1.02 }}
              className={`${rc.bg} rounded-2xl p-5 transition-shadow ${editRates[rc.type] !== rates[rc.type] ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center">
                  <rc.icon className={`w-5 h-5 ${rc.text}`} />
                </div>
                <p className={`font-semibold ${rc.text}`}>{rc.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${rc.text}`}>₹</span>
                <Input
                  type="number"
                  min={1}
                  value={editRates[rc.type]}
                  onChange={e => setEditRates(prev => ({ ...prev, [rc.type]: Number(e.target.value) }))}
                  className="rounded-xl bg-card/60 border-0 font-bold text-lg h-12"
                />
                <span className={`text-sm ${rc.text} opacity-70 whitespace-nowrap`}>/ hr</span>
              </div>
              {editRates[rc.type] !== rates[rc.type] && (
                <p className="text-xs mt-2 font-medium text-primary">
                  Changed from ₹{rates[rc.type]}/hr
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slot Configuration */}
      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-5">Slot Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slotConfig.map(item => (
            <div key={item.type} className={`${item.bg} rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-card/50 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.text}`} />
                </div>
                <div>
                  <p className={`font-semibold ${item.text}`}>{item.type} Slots</p>
                  <p className={`text-xs ${item.text} opacity-60`}>{item.occupied} / {item.count} occupied</p>
                </div>
              </div>
              <div className="w-full bg-card/40 rounded-full h-2.5">
                <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${(item.occupied / item.count) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-5">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'System', value: 'ParkSmart v1.0' },
            { label: 'Floors', value: '2' },
            { label: 'Operating Hours', value: '24/7' },
            { label: 'Status', value: 'Active' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-2xl bg-muted/50">
              <p className="text-muted-foreground text-xs font-medium">{item.label}</p>
              <p className="font-semibold mt-1.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}