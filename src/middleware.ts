import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname.startsWith('/admin/login');

  if (isAdminRoute && !session) {
    // If trying to access admin route without a session, redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && session) {
    // Check if the user is an admin
    const { data: adminProfile, error } = await supabase
      .from('admin_profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (error || !adminProfile) {
      // Not an admin or error fetching profile, redirect to unauthorized or home
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/'; // Redirect to home page
      redirectUrl.searchParams.set('message', 'You are not authorized to access the admin panel.');
      return NextResponse.redirect(redirectUrl);
    }

    // If on login page but already authenticated as admin, redirect to dashboard
    if (isLoginPage) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // Apply middleware to all /admin routes
};
