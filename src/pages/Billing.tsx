import { useParkingStore } from '@/lib/parking-store';
import { Receipt, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Billing() {
  const { records, getVehicle, getSlot } = useParkingStore();

  const completedRecords = records
    .filter(r => r.exitTime)
    .sort((a, b) => new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground mt-1">Transaction history and receipts</p>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Receipt #</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vehicle</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Slot</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Duration</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {completedRecords.map((r, i) => {
              const v = getVehicle(r.vehicleId);
              const s = getSlot(r.slotId);
              const hrs = Math.floor((r.duration || 0) / 60);
              const mins = (r.duration || 0) % 60;
              return (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{r.id.toUpperCase()}</td>
                  <td className="py-3 px-4 font-medium">{v?.vehicleNumber}</td>
                  <td className="py-3 px-4">{s?.number}</td>
                  <td className="py-3 px-4 flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" />{hrs}h {mins}m</td>
                  <td className="py-3 px-4 font-semibold">₹{r.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${r.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {r.paymentStatus === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {r.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{r.exitTime ? new Date(r.exitTime).toLocaleDateString() : '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
