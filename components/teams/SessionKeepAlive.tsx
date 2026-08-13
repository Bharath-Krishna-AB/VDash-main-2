'use client';

// SessionKeepAlive.tsx
// Mounts the Supabase browser client so its built-in background refresh
// interval keeps the auth session alive even when the user sits idle on the
// timer page for extended periods (30–60+ minutes) without any navigation.
// The browser client automatically renews the access token ~10 minutes before
// it expires, using the refresh token stored in cookies — no server requests
// from the app side required.

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SessionKeepAlive() {
  useEffect(() => {
    // Instantiating the browser client is enough: @supabase/ssr internally
    // starts a timer that fires before the JWT expiry and fetches a new token.
    const supabase = createClient();

    // Subscribe to auth state changes so the local cookie is kept in sync.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // No-op handler — subscribing is what activates the refresh timer.
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // Renders nothing
}
