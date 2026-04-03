import { useState } from 'react';
import { useAuthStore } from '@/lib/supabase-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParkingSquare, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { login, signup } = useAuthStore();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (mode === 'signup' && !/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await signup(name, email, password);
        toast.success('Account created successfully!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ParkingSquare className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold">ParkSmart</h1>
          <p className="text-muted-foreground text-sm mt-1">Parking Management System</p>
        </div>

        {/* Card */}
        <div className="glass-card !p-8">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'login' ? 'Sign in to your account' : 'Get started with ParkSmart'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-1.5">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={() => setErrors({...errors, name: undefined})}
                        className="pl-10 rounded-xl h-12"
                        aria-label="Full name"
                      />
                    </div>
                    {errors.name && (
                      <div className="flex items-center gap-2 text-destructive text-sm px-3">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setErrors({...errors, email: undefined})}
                  className="pl-10 rounded-xl h-12"
                  aria-label="Email address"
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-destructive text-sm px-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setErrors({...errors, password: undefined})}
                  className="pl-10 pr-10 rounded-xl h-12"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-destructive text-sm px-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </div>
              )}
            </div>

            <Button className="w-full rounded-xl h-12 text-base font-semibold" disabled={loading}>
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </span>{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setName(''); }}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>


        </div>
      </motion.div>
    </div>
  );
}