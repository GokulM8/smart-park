import { Car, ParkingSquare, DollarSign, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import { useParkingStore } from '@/lib/parking-store';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))'];

export default function Dashboard() {
  const { slots, getActiveRecords, getTotalRevenue, getTodayRevenue, records, getVehicle, getSlot } = useParkingStore();

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const availableSlots = totalSlots - occupiedSlots;
  const activeRecords = getActiveRecords();
  const occupancyPercent = Math.round((occupiedSlots / totalSlots) * 100);

  const slotsByType = [
    { name: 'Car', total: slots.filter(s => s.type === 'car').length, occupied: slots.filter(s => s.type === 'car' && s.status === 'occupied').length },
    { name: 'Bike', total: slots.filter(s => s.type === 'bike').length, occupied: slots.filter(s => s.type === 'bike' && s.status === 'occupied').length },
    { name: 'EV', total: slots.filter(s => s.type === 'ev').length, occupied: slots.filter(s => s.type === 'ev' && s.status === 'occupied').length },
  ];

  const pieData = [
    { name: 'Occupied', value: occupiedSlots },
    { name: 'Available', value: availableSlots },
  ];

  const recentActivity = activeRecords.slice(0, 5).map(r => ({
    record: r,
    vehicle: getVehicle(r.vehicleId),
    slot: getSlot(r.slotId),
    entry: new Date(r.entryTime),
  }));

  // Active slots by type for the colored cards
  const activeByType = [
    { type: 'Car', count: activeRecords.filter(r => getSlot(r.slotId)?.type === 'car').length, bg: 'bg-lavender', text: 'text-lavender-foreground' },
    { type: 'Bike', count: activeRecords.filter(r => getSlot(r.slotId)?.type === 'bike').length, bg: 'bg-ice', text: 'text-ice-foreground' },
    { type: 'EV', count: activeRecords.filter(r => getSlot(r.slotId)?.type === 'ev').length, bg: 'bg-peach', text: 'text-peach-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Parking Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview · {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex -space-x-2">
          {['A', 'S', 'P'].map((l, i) => (
            <div key={i} className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-xs font-bold text-primary border-2 border-card">
              {l}
            </div>
          ))}
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground border-2 border-card">
            +3
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Slots" value={totalSlots} icon={ParkingSquare} color="lavender" subtitle={`${availableSlots} available`} />
        <StatCard title="Vehicles Parked" value={occupiedSlots} icon={Car} color="peach" trend={{ value: 12, positive: true }} />
        <StatCard title="Today's Revenue" value={`₹${getTodayRevenue().toLocaleString()}`} icon={DollarSign} color="ice" />
        <StatCard title="Total Revenue" value={`₹${getTotalRevenue().toLocaleString()}`} icon={TrendingUp} color="primary" trend={{ value: 8, positive: true }} />
      </div>

      {/* Active Vehicles Cards + Occupancy Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg">Active Vehicles</h3>
            <Link to="/entry-exit" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeByType.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`${item.bg} rounded-2xl p-5 relative overflow-hidden`}
              >
                <span className={`text-xs font-semibold ${item.text} bg-card/50 px-2.5 py-1 rounded-lg`}>
                  {item.type} Parking
                </span>
                <p className={`text-4xl font-display font-bold mt-4 ${item.text}`}>{item.count}</p>
                <p className={`text-sm mt-1 ${item.text} opacity-70`}>vehicles parked</p>
                <div className="mt-4 flex -space-x-1.5">
                  {Array.from({ length: Math.min(item.count, 3) }).map((_, j) => (
                    <div key={j} className="w-7 h-7 rounded-full bg-card/60 border-2 border-card/30 flex items-center justify-center text-[10px] font-bold text-foreground/60">
                      {String.fromCharCode(65 + j)}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-card/40 rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${Math.min(100, (item.count / 5) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium opacity-60">{item.count}/{item.type === 'Bike' ? 6 : item.type === 'EV' ? 4 : 8}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-2">Slot Occupancy</h3>
          <p className="text-xs text-muted-foreground mb-3">Total slots {totalSlots}</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={4} stroke="hsl(var(--card))">
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--warning))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Occupied</p>
              </div>
              <p className="text-xl font-display font-bold">{occupancyPercent}%</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-warning" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Available</p>
              </div>
              <p className="text-xl font-display font-bold">{100 - occupancyPercent}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row: Slot Utilization + Currently Parked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg">Slot Utilization</h3>
            <Link to="/reports" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={slotsByType} barGap={4} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '13px' }} />
              <Bar dataKey="total" fill="hsl(var(--lavender))" radius={[8, 8, 8, 8]} name="Total" />
              <Bar dataKey="occupied" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} name="Occupied" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg">Currently Parked</h3>
            <Link to="/entry-exit" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const dur = Math.round((Date.now() - a.entry.getTime()) / 60000);
              const hrs = Math.floor(dur / 60);
              const mins = dur % 60;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-sm font-bold text-lavender-foreground">
                    {a.vehicle?.ownerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.vehicle?.ownerName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{a.vehicle?.vehicleNumber}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{a.slot?.number}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> {hrs}h {mins}m
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
