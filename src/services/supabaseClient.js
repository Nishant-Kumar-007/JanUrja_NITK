// ==============================================================================
// Supabase Client Wrapper with Resilient Hybrid Fallback & Full Auth Support
// Connects to live Supabase Postgres/Realtime/Auth if configured,
// or transparently routes to our mockDb for 100% offline hackathon presentation.
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { mockDb } from './mockDatabase';

const ENV_URL = import.meta.env.VITE_SUPABASE_URL;
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check user-configured override in localStorage
const customUrl = localStorage.getItem('janurja_custom_supabase_url');
const customKey = localStorage.getItem('janurja_custom_supabase_key');

const supabaseUrl = customUrl || ENV_URL;
const supabaseKey = customKey || ENV_KEY;

export const isLiveSupabaseAvailable = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('your-anon-key')
);

// Live Supabase Client instance
export const supabase = isLiveSupabaseAvailable
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const liveSupabase = supabase;

// Unified Database & Auth Facade
export const db = {
  isLive: () => Boolean(supabase),
  
  from: (table) => {
    if (supabase) {
      return supabase.from(table);
    }
    return mockDb.from(table);
  },

  // Auth Methods (Delegates to real Supabase Auth or mock local session)
  auth: {
    signUp: async ({ email, password, options }) => {
      if (supabase) {
        return await supabase.auth.signUp({ email, password, options });
      }
      // Local fallback mock auth
      const mockUser = {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: options?.data || {}
      };
      localStorage.setItem('janurja_auth_user', JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { access_token: 'mock-jwt-token' } }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      if (supabase) {
        return await supabase.auth.signInWithPassword({ email, password });
      }
      const mockUser = {
        id: `usr-${Date.now()}`,
        email
      };
      localStorage.setItem('janurja_auth_user', JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { access_token: 'mock-jwt-token' } }, error: null };
    },

    signInWithOtp: async ({ email }) => {
      if (supabase) {
        return await supabase.auth.signInWithOtp({ email });
      }
      return { data: { message: 'Mock OTP sent (Use 123456)' }, error: null };
    },

    resetPasswordForEmail: async (email, options) => {
      if (supabase) {
        return await supabase.auth.resetPasswordForEmail(email, options);
      }
      return { data: {}, error: null };
    },

    updateUser: async (attributes) => {
      if (supabase) {
        return await supabase.auth.updateUser(attributes);
      }
      return { data: { user: attributes }, error: null };
    },

    resend: async (options) => {
      if (supabase) {
        return await supabase.auth.resend(options);
      }
      return { data: {}, error: null };
    },

    getUser: async () => {
      if (supabase) {
        return await supabase.auth.getUser();
      }
      const raw = localStorage.getItem('janurja_auth_user');
      const user = raw ? JSON.parse(raw) : null;
      return { data: { user }, error: null };
    },

    signOut: async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('janurja_auth_user');
      return { error: null };
    },

    getSession: async () => {
      if (supabase) {
        return await supabase.auth.getSession();
      }
      const raw = localStorage.getItem('janurja_auth_user');
      const user = raw ? JSON.parse(raw) : null;
      return { data: { session: user ? { user } : null }, error: null };
    },

    onAuthStateChange: (callback) => {
      if (supabase) {
        return supabase.auth.onAuthStateChange(callback);
      }
      // Mock listener
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  // Realtime subscription helper
  subscribeToTable: (table, callback) => {
    if (supabase) {
      const channel = supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          callback({
            table,
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Mock db subscription
      return mockDb.subscribe((event) => {
        if (event.table === '*' || event.table === table) {
          callback(event);
        }
      });
    }
  },

  // Save new Supabase credentials and reload
  configureCredentials: (url, key) => {
    if (url && key) {
      localStorage.setItem('janurja_custom_supabase_url', url.trim());
      localStorage.setItem('janurja_custom_supabase_key', key.trim());
    } else {
      localStorage.removeItem('janurja_custom_supabase_url');
      localStorage.removeItem('janurja_custom_supabase_key');
    }
    window.location.reload();
  },

  getCredentials: () => {
    return {
      url: supabaseUrl || '',
      key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : '',
      isCustom: Boolean(customUrl && customKey),
      isLive: Boolean(supabase)
    };
  }
};

