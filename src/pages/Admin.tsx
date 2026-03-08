import { useParkingStore } from '@/lib/parking-store';
import { Settings, Users, ParkingSquare, Activity, Car, Bike, Zap } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function Admin() {
  const { slots, vehicles, records } = useParkingStore();
  const activeRecords = records.filter(r => !r.exitTime);

  const slotConfig = [
    { type: 'Car', icon: Car, count: slots.filter(s => s.type === 'car').length, occupied: slots.filter(s => s.type === 'car' && s.status === 'occupied').length, bg: 'bg-lavender', text: 'text-lavender-foreground' },
    { type: 'Bike', icon: Bike, count: slots.filter(s => s.type === 'bike').length, occupied: slots.filter(s => s.type === 'bike' && s.status === 'occupied').length, bg: 'bg-ice', text: 'text-ice-foreground' },
    { type: 'EV', icon: Zap, count: slots.filter(s => s.type === 'ev').length, occupied: slots.filter(s => s.type === 'ev' && s.status === 'occupied').length, bg: 'bg-peach', text: 'text-peach-foreground' },
  ];

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
