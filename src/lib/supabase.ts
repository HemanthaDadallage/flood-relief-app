import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers'; // For server-side client

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client for Server Components and Route Handlers
export function createServerClient() {
  const cookieStore = cookies(); // Access cookies for server components

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `cookies()` may not be called from a Client Component
          // in a Server with `revalidatePath`, `redirect`, or `headers`.
          // To fix this, you can pass `use client` in your client component
          // or pass the cookie from a Server Component with `request.headers.get('cookie')`
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `cookies()` may not be called from a Client Component
          // in a Server with `revalidatePath`, `redirect`, or `headers`.
          // To fix this, you can pass `use client` in your client component
          // or pass the cookie from a Server Component with `request.headers.get('cookie')`
        }
      },
    },
  });
}
