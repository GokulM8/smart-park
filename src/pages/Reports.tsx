import { useParkingStore } from '@/lib/parking-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

export default function Reports() {
  const { records, slots, getVehicle } = useParkingStore();

  const completedRecords = records.filter(r => r.exitTime && r.paymentStatus === 'paid');

  // Daily revenue (last 7 days)
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

  // Vehicle type distribution
  const typeStats = ['car', 'bike', 'ev'].map(t => ({
    type: t === 'ev' ? 'EV' : t.charAt(0).toUpperCase() + t.slice(1),
    count: completedRecords.filter(r => {
      const v = getVehicle(r.vehicleId);
      return v?.vehicleType === t;
    }).length,
  }));

  // Slot utilization
  const utilization = slots.filter(s => s.status === 'occupied').length / slots.length * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Parking insights and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-4xl font-display font-bold mt-2">{completedRecords.length}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-4xl font-display font-bold mt-2 text-success">₹{completedRecords.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground">Current Utilization</p>
          <p className="text-4xl font-display font-bold mt-2 text-primary">{utilization.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="font-display font-semibold text-lg mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(174, 62%, 38%)" strokeWidth={2} dot={{ fill: 'hsl(174, 62%, 38%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="stat-card">
          <h3 className="font-display font-semibold text-lg mb-4">Vehicle Type Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={typeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="type" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
