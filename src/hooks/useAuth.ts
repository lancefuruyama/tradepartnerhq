import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const USE_SUPABASE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo mode state (when Supabase isn't configured)
  const [demoEmail, setDemoEmail] = useState('');

  useEffect(() => {
    if (!USE_SUPABASE) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!USE_SUPABASE) {
      setDemoEmail(email);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!USE_SUPABASE) {
      setDemoEmail(email);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!USE_SUPABASE) {
      setDemoEmail('');
      return;
    }
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoggedIn: USE_SUPABASE ? !!user : !!demoEmail,
    userEmail: USE_SUPABASE ? (user?.email || '') : demoEmail,
    userId: USE_SUPABASE ? (user?.id || '') : 'demo-user',
    loading,
    signUp,
    signIn,
    signOut,
    isLive: USE_SUPABASE,
  };
}
