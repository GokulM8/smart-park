import { useParkingStore } from '@/lib/parking-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Reports() {
  const { records, slots, getVehicle } = useParkingStore();

  const completedRecords = records.filter(r => r.exitTime && r.paymentStatus === 'paid');

  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const dayRecords = completedRecords.filter(r => r.exitTime && new Date(r.exitTime).toDateString() === dateStr);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      revenue: dayRecords.reduce((s, r) => s + (r.amount || 0), 0),
      vehicles: dayRecords.length,
    };
  });

  const typeStats = ['car', 'bike', 'ev'].map(t => ({
    type: t === 'ev' ? 'EV' : t.charAt(0).toUpperCase() + t.slice(1),
    count: completedRecords.filter(r => {
      const v = getVehicle(r.vehicleId);
      return v?.vehicleType === t;
    }).length,
  }));

  const utilization = Math.round(slots.filter(s => s.status === 'occupied').length / slots.length * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Parking insights and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Total Transactions', value: completedRecords.length, bg: 'bg-lavender', text: 'text-lavender-foreground' },
          { label: 'Total Revenue', value: `₹${completedRecords.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}`, bg: 'bg-ice', text: 'text-ice-foreground' },
          { label: 'Current Utilization', value: `${utilization}%`, bg: 'bg-peach', text: 'text-peach-foreground' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`${item.bg} rounded-2xl p-6 text-center`}>
            <p className={`text-sm font-medium ${item.text} opacity-70`}>{item.label}</p>
            <p className={`text-4xl font-display font-bold mt-2 ${item.text}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-5">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-5">Vehicle Type Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeStats} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
              <Bar dataKey="count" radius={[10, 10, 10, 10]}>
                {typeStats.map((_, i) => {
                  const fills = ['hsl(var(--lavender-foreground))', 'hsl(var(--warning))', 'hsl(var(--primary))'];
                  return <motion.rect key={i} fill={fills[i]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
