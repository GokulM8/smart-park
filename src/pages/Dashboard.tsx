import { Car, ParkingSquare, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import { useParkingStore } from '@/lib/parking-store';
import { motion } from 'framer-motion';

const COLORS = ['hsl(174, 62%, 38%)', 'hsl(199, 89%, 48%)', 'hsl(152, 60%, 40%)', 'hsl(38, 92%, 50%)'];

export default function Dashboard() {
  const { slots, getActiveRecords, getTotalRevenue, getTodayRevenue, records, getVehicle, getSlot } = useParkingStore();

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const availableSlots = totalSlots - occupiedSlots;
  const activeRecords = getActiveRecords();

  const slotsByType = [
    { name: 'Car', total: slots.filter(s => s.type === 'car').length, occupied: slots.filter(s => s.type === 'car' && s.status === 'occupied').length },
    { name: 'Bike', total: slots.filter(s => s.type === 'bike').length, occupied: slots.filter(s => s.type === 'bike' && s.status === 'occupied').length },
    { name: 'EV', total: slots.filter(s => s.type === 'ev').length, occupied: slots.filter(s => s.type === 'ev' && s.status === 'occupied').length },
  ];

  const pieData = [
    { name: 'Available', value: availableSlots },
    { name: 'Occupied', value: occupiedSlots },
  ];

  const recentActivity = activeRecords.slice(0, 5).map(r => ({
    vehicle: getVehicle(r.vehicleId),
    slot: getSlot(r.slotId),
    entry: new Date(r.entryTime),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time parking overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Slots" value={totalSlots} icon={ParkingSquare} color="primary" subtitle={`${availableSlots} available`} />
        <StatCard title="Vehicles Parked" value={occupiedSlots} icon={Car} color="warning" trend={{ value: 12, positive: true }} />
        <StatCard title="Today's Revenue" value={`₹${getTodayRevenue().toLocaleString()}`} icon={DollarSign} color="success" />
        <StatCard title="Total Revenue" value={`₹${getTotalRevenue().toLocaleString()}`} icon={TrendingUp} color="primary" trend={{ value: 8, positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Slot Utilization by Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={slotsByType} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="total" fill={COLORS[0]} radius={[6, 6, 0, 0]} name="Total" />
              <Bar dataKey="occupied" fill={COLORS[3]} radius={[6, 6, 0, 0]} name="Occupied" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <h3 className="font-display font-semibold text-lg mb-4">Occupancy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS[2] : COLORS[3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success" /> Available</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning" /> Occupied</span>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="stat-card">
        <h3 className="font-display font-semibold text-lg mb-4">Currently Parked Vehicles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Owner</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Slot</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Entry Time</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a, i) => {
                const dur = Math.round((Date.now() - a.entry.getTime()) / 60000);
                const hrs = Math.floor(dur / 60);
                const mins = dur % 60;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{a.vehicle?.vehicleNumber}</td>
                    <td className="py-3 px-4">{a.vehicle?.ownerName}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{a.slot?.number}</span></td>
                    <td className="py-3 px-4">{a.entry.toLocaleTimeString()}</td>
                    <td className="py-3 px-4 flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" />{hrs}h {mins}m</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
