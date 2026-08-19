import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey);
}

export function getSupabaseConfigurationError(): string | null {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('connection URL');
  if (!supabaseKey) missing.push('anon key');
  if (missing.length === 0) return null;
  return `Authentication configuration is missing: ${missing.join(' and ')}.`;
}

function createSafeStorage() {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  try {
    const testKey = '__sb_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    const memoryStore = new Map<string, string>();
    return {
      getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null) as string | null,
      setItem: (key: string, value: string) => { memoryStore.set(key, value); },
      removeItem: (key: string) => { memoryStore.delete(key); },
    };
  }
}

if (!isSupabaseConfigured()) {
  throw new Error(getSupabaseConfigurationError() ?? 'Supabase is not configured.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: createSafeStorage() as never,
  },
});

let sessionReady = false;
let sessionReadyCallbacks: Array<() => void> = [];

function notifySessionReady() {
  sessionReady = true;
  sessionReadyCallbacks.forEach((cb) => cb());
  sessionReadyCallbacks = [];
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
    notifySessionReady();
  }
});

export async function getSessionSafe() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export function waitForAuthReady(timeoutMs = 6000): Promise<boolean> {
  if (sessionReady) return Promise.resolve(true);
  return new Promise((resolve) => {
    const cb = () => resolve(true);
    sessionReadyCallbacks.push(cb);
    setTimeout(() => {
      const idx = sessionReadyCallbacks.indexOf(cb);
      if (idx !== -1) {
        sessionReadyCallbacks.splice(idx, 1);
        resolve(false);
      }
    }, timeoutMs);
  });
}