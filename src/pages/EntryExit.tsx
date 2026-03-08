import { useState, useEffect } from 'react';
import { useParkingStore, BillPreview } from '@/lib/parking-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, ArrowUpFromLine, Search, Clock, Receipt, CheckCircle, CreditCard, IndianRupee, Car, Bike, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const vehicleIcons = { car: Car, bike: Bike, ev: Zap };

export default function EntryExit() {
  const { vehicles, slots, records, vehicleEntry, vehicleExit, calculateBill, getVehicle, getSlot } = useParkingStore();
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [exitRecordId, setExitRecordId] = useState<string | null>(null);
  const [bill, setBill] = useState<BillPreview | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activeRecords = records.filter(r => !r.exitTime);
  const matchedVehicle = vehicles.find(v => v.vehicleNumber.toLowerCase() === vehicleSearch.toLowerCase());
  const isAlreadyParked = matchedVehicle && activeRecords.some(r => r.vehicleId === matchedVehicle.id);
  const availableSlots = matchedVehicle ? slots.filter(s => s.status === 'available' && s.type === matchedVehicle.vehicleType) : [];

  const handleEntry = () => {
    if (!matchedVehicle) { toast.error('Vehicle not found. Register it first.'); return; }
    if (isAlreadyParked) { toast.error('Vehicle is already parked.'); return; }
    if (availableSlots.length === 0) { toast.error('No available slots for this vehicle type.'); return; }
    const slot = availableSlots[0];
    vehicleEntry(matchedVehicle.id, slot.id);
    toast.success(`Vehicle ${matchedVehicle.vehicleNumber} parked at slot ${slot.number}`);
    setVehicleSearch('');
  };

  const openPaymentDialog = (recordId: string) => {
    const preview = calculateBill(recordId);
    if (!preview) return;
    setBill(preview);
    setExitRecordId(recordId);
    setPaymentSuccess(false);
    setProcessing(false);
  };

  const handlePayment = () => {
    if (!exitRecordId) return;
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const handleConfirmExit = () => {
    if (!exitRecordId) return;
    const result = vehicleExit(exitRecordId);
    const vehicle = getVehicle(result.vehicleId);
    toast.success(`Vehicle ${vehicle?.vehicleNumber} exited successfully. ₹${result.amount} paid.`);
    setExitRecordId(null);
    setBill(null);
    setPaymentSuccess(false);
  };

  const closeDialog = () => {
    if (processing) return;
    setExitRecordId(null);
    setBill(null);
    setPaymentSuccess(false);
  };

  // Live-update bill while dialog is open
  useEffect(() => {
    if (!exitRecordId || paymentSuccess) return;
    const interval = setInterval(() => {
      const preview = calculateBill(exitRecordId);
      if (preview) setBill(preview);
    }, 30000);
    return () => clearInterval(interval);
  }, [exitRecordId, paymentSuccess, calculateBill]);

  const billVehicle = bill ? getVehicle(bill.vehicleId) : null;
  const billSlot = bill ? getSlot(bill.slotId) : null;
  const VehicleIcon = bill ? vehicleIcons[bill.vehicleType] : Car;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Entry & Exit</h1>
        <p className="text-muted-foreground mt-1">Manage vehicle check-in and check-out</p>
      </div>

      {/* Entry section */}
      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center"><ArrowDownToLine className="w-4 h-4 text-success" /></span>
          Vehicle Entry
        </h3>
        <div className="flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Enter vehicle number..." className="pl-10 rounded-xl" value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />
          </div>
          <Button className="rounded-xl" onClick={handleEntry} disabled={!matchedVehicle || !!isAlreadyParked}>
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Check In
          </Button>
        </div>
        {matchedVehicle && !isAlreadyParked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3.5 rounded-xl bg-success/10 text-sm">
            <span className="font-semibold">Found:</span> {matchedVehicle.ownerName} — {matchedVehicle.vehicleType.toUpperCase()} — {availableSlots.length} slots available
          </motion.div>
        )}
        {matchedVehicle && isAlreadyParked && (
          <p className="mt-3 text-sm text-warning font-medium">This vehicle is already parked.</p>
        )}
      </div>

      {/* Active sessions */}
      <div className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-warning/15 flex items-center justify-center"><ArrowUpFromLine className="w-4 h-4 text-warning" /></span>
          Active Parking Sessions
        </h3>
        <div className="space-y-3">
          {activeRecords.map(r => {
            const v = getVehicle(r.vehicleId);
            const s = getSlot(r.slotId);
            const dur = Math.round((Date.now() - new Date(r.entryTime).getTime()) / 60000);
            return (
              <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-sm font-bold text-lavender-foreground">
                  {v?.ownerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{v?.ownerName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v?.vehicleNumber}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hidden sm:inline">{s?.number}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {Math.floor(dur / 60)}h {dur % 60}m
                </span>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openPaymentDialog(r.id)}>
                  <ArrowUpFromLine className="w-3 h-3 mr-1" /> Exit
                </Button>
              </div>
            );
          })}
          {activeRecords.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No active parking sessions</div>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!exitRecordId} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {!paymentSuccess ? (
              <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Bill header */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b border-border">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-display">
                      <Receipt className="w-5 h-5 text-primary" />
                      Parking Bill
                    </DialogTitle>
                    <DialogDescription>Complete payment to exit the parking slot</DialogDescription>
                  </DialogHeader>
                </div>

                {bill && (
                  <div className="p-6 space-y-5">
                    {/* Vehicle & slot info */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <VehicleIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{billVehicle?.ownerName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{billVehicle?.vehicleNumber}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-lavender text-lavender-foreground text-sm font-bold">{billSlot?.number}</span>
                    </div>

                    {/* Bill breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Time</span>
                        <span className="font-medium">{new Date(bill.entryTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{Math.floor(bill.duration / 60)}h {bill.duration % 60}m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate ({bill.vehicleType.toUpperCase()})</span>
                        <span className="font-medium">₹{bill.rate}/hr</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-2xl font-display font-bold text-primary">₹{bill.amount}</span>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['cash', 'card', 'upi'] as const).map(method => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                              paymentMethod === method
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            {method === 'cash' && <IndianRupee className="w-3.5 h-3.5 inline mr-1" />}
                            {method === 'card' && <CreditCard className="w-3.5 h-3.5 inline mr-1" />}
                            {method === 'upi' && '⚡ '}
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pay button */}
                    <Button
                      className="w-full rounded-xl h-12 text-base font-semibold"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          />
                          Processing Payment...
                        </motion.div>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay ₹{bill.amount}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-10 h-10 text-success" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-display font-bold">Payment Successful!</h3>
                  <p className="text-muted-foreground mt-1 text-sm">₹{bill?.amount} paid via {paymentMethod}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{billVehicle?.vehicleNumber}</p>
                  <p>Slot {billSlot?.number} will be released</p>
                </div>
                <Button className="w-full rounded-xl h-12 text-base font-semibold" onClick={handleConfirmExit}>
                  <ArrowUpFromLine className="w-5 h-5 mr-2" />
                  Complete Exit
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}