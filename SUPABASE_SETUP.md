# Supabase Integration Setup Guide

## Overview
ParkSmart now uses **Supabase** as the backend. This guide walks you through setting up Supabase and integrating it with your React app.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free account available)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `park-smart-hub` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., `us-east-1` for US)
4. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Get Your API Keys

1. Once the project is ready, go to **Settings → API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

## Step 3: Set Environment Variables

1. Create/update `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Never commit** `.env.local` to git (it's in `.gitignore`)

## Step 4: Initialize Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `supabase/migrations/001_init_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** button
6. Wait for tables to be created (should see green checkmark)

### Option B: Using Supabase CLI (Recommended for teams)

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your_project_id

# Run migrations
supabase db push
```

## Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js
# or
bun add @supabase/supabase-js
```

## Step 6: Verify Setup

1. Run your app:
```bash
npm run dev
# or
bun run dev
```

2. Check the browser console for errors
3. Try to sign up with a test account
4. Check Supabase dashboard → **Authentication → Users** to see your account

## Step 7: Enable Email Confirmation (Optional but Recommended)

1. Go to **Authentication → Providers → Email**
2. Set **Email Confirmations**: `Confirm email`
3. Users will receive confirmation emails on signup

## Key Files Created

- `supabase/migrations/001_init_schema.sql` — Database schema with tables, RLS, indexes
- `src/types/supabase.ts` — TypeScript types for all tables
- `src/lib/supabase.ts` — Supabase client configuration
- `src/lib/supabase-auth-store.ts` — Authentication store (replaces localStorage auth)
- `src/hooks/use-supabase.ts` — Database query hooks for vehicles, slots, logs, invoices, reservations

## Database Schema Overview

### Tables Created:

1. **users** — User profiles (extends Supabase auth)
2. **vehicles** — User vehicles (make, model, license plate)
3. **parking_slots** — Parking spaces with rates and features
4. **entry_exit_logs** — Parking history with duration and cost
5. **invoices** — Billing records
6. **reservations** — Slot reservations
7. **reports** — Analytics and reports

### Row Level Security (RLS)

All tables have RLS enabled:
- **Users** see only their own data (except admins)
- **Staff** can manage parking slots
- **Admins** can view all data and generate reports

## Usage Examples

### Authentication

```typescript
import { useAuthStore } from '@/lib/supabase-auth-store';

// In your component
const { user, login, logout } = useAuthStore();

// Login
await login('user@example.com', 'password123');

// Logout
await logout();
```

### Query Vehicles

```typescript
import { useVehicles } from '@/hooks/use-supabase';

function VehiclesList() {
  const { vehicles, loading, fetchVehicles, addVehicle } = useVehicles(userId);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    await addVehicle({
      user_id: userId,
      license_plate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      vehicle_type: 'sedan',
    });
  };

  return (
    // Your component JSX
  );
}
```

### Query Parking Slots

```typescript
import { useParkingSlots } from '@/hooks/use-supabase';

function SlotsList() {
  const { slots, loading, fetchSlots } = useParkingSlots();

  useEffect(() => {
    // Fetch available slots
    fetchSlots({ status: 'available' });
  }, []);

  // Your component JSX
}
```

## Real-time Subscriptions (Advanced)

```typescript
import { supabase } from '@/lib/supabase';

useEffect(() => {
  const subscription = supabase
    .from('parking_slots')
    .on('*', (payload) => {
      console.log('Slot updated:', payload);
      // Update UI with real-time data
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Missing environment variables"
- Check `.env.local` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env vars

### "RLS policy violation"
- Check row-level security policies in Supabase dashboard
- Ensure user is authenticated: `supabase.auth.getSession()`

### "Can't see my data"
- Check Supabase **Table Editor** to verify data exists
- Check **Authentication → Users** to see if user is created
- Verify email is the same between auth and users table

## Next Steps

1. ✅ Update `AuthPage` to use Supabase auth instead of localStorage
2. ✅ Update `Dashboard` to show real data from parking_slots table
3. ✅ Integrate `useVehicles` hook in Vehicles page
4. ✅ Add real-time updates for slot availability
5. ✅ Implement billing calculations with entry_exit_logs
6. ✅ Add admin dashboard with reports

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)
