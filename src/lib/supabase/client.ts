// Browser-side Supabase client (used in Client Components)
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project")) {
    const mockQuery: any = {
      select: () => mockQuery,
      from: () => mockQuery,
      eq: () => mockQuery,
      in: () => mockQuery,
      order: () => mockQuery,
      limit: () => mockQuery,
      single: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      insert: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) }),
      update: () => ({ eq: () => (async () => ({ data: {}, error: null })) }),
      delete: () => ({ eq: () => (async () => ({ error: null })) }),
    };

    return {
      auth: {
        getUser: async () => ({ data: { user: { id: "mock-user", email: "demo@evonance.com" } }, error: null }),
        getSession: async () => ({ data: { session: { user: { id: "mock-user" } } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: { user: { id: "mock-user" } }, error: null }),
        signInWithPassword: async () => ({ data: { user: { id: "mock-user" }, session: {} }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => mockQuery,
    } as any;
  }

  return createBrowserClient<Database>(url, key);
}
