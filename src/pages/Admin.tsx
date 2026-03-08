import { useParkingStore } from '@/lib/parking-store';
import { Settings, Users, ParkingSquare, Activity, Car, Bike, Zap } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function Admin() {
  const { slots, vehicles, records } = useParkingStore();

  const activeRecords = records.filter(r => !r.exitTime);

  const stats = {
    totalSlots: slots.length,
    carSlots: slots.filter(s => s.type === 'car').length,
    bikeSlots: slots.filter(s => s.type === 'bike').length,
    evSlots: slots.filter(s => s.type === 'ev').length,
    registeredVehicles: vehicles.length,
    activeSessions: activeRecords.length,
    totalTransactions: records.filter(r => r.exitTime).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">System configuration and monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Slots" value={stats.totalSlots} icon={ParkingSquare} color="primary" />
        <StatCard title="Registered Vehicles" value={stats.registeredVehicles} icon={Users} color="success" />
        <StatCard title="Active Sessions" value={stats.activeSessions} icon={Activity} color="warning" />
        <StatCard title="Total Transactions" value={stats.totalTransactions} icon={Settings} color="primary" />
      </div>

      <div className="stat-card">
        <h3 className="font-display font-semibold text-lg mb-4">Slot Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'Car', icon: Car, count: stats.carSlots, occupied: slots.filter(s => s.type === 'car' && s.status === 'occupied').length },
            { type: 'Bike', icon: Bike, count: stats.bikeSlots, occupied: slots.filter(s => s.type === 'bike' && s.status === 'occupied').length },
            { type: 'EV', icon: Zap, count: stats.evSlots, occupied: slots.filter(s => s.type === 'ev' && s.status === 'occupied').length },
          ].map(item => (
            <div key={item.type} className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.type} Slots</p>
                  <p className="text-xs text-muted-foreground">{item.occupied} / {item.count} occupied</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(item.occupied / item.count) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-display font-semibold text-lg mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'System', value: 'ParkSmart v1.0' },
            { label: 'Floors', value: '2' },
            { label: 'Operating Hours', value: '24/7' },
            { label: 'Status', value: 'Active' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              <p className="font-semibold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
