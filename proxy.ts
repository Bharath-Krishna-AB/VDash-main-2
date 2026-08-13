// proxy.ts  (Next.js treats this as the middleware entry point)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write refreshed tokens onto the *request* so downstream server
          // components can read them, then rebuild `res` so the Set-Cookie
          // headers are forwarded to the browser.
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: calling getUser() refreshes the Supabase session if the access
  // token has expired (it silently uses the refresh token). The refreshed
  // cookies are written into `res` via setAll above.  All redirect responses
  // below must copy those cookies so the browser receives the renewed session.
  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Helper: redirect while preserving any refreshed Supabase session cookies
  const redirectTo = (url: string) => {
    const redirect = NextResponse.redirect(new URL(url, req.url));
    // Copy every cookie that Supabase may have written into `res`
    res.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  };

  // Public routes: QR scan landing pages are accessible without any login
  // so participants can see their clues by scanning a physical QR code.
  const isPublicQrPage = /^\/teams\/[^\/]+\/qr\/[^\/]+/.test(path);
  if (isPublicQrPage) return res;

  if (!user) {
    if (path === '/login' || path === '/') return res;
    return redirectTo('/login');
  }

  // Profile details fetched from cookies instead of database lookup
  const role = req.cookies.get('user_role')?.value;
  const username = req.cookies.get('user_name')?.value;

  // Auto-redirect logged-in users away from /login and /
  if ((path === '/login' || path === '/') && role) {
    if (role === 'admin') return redirectTo('/admin');
    if (role === 'user' && username) return redirectTo(`/teams/${username}`);
  }

  // Strict 1:1 Role Routing
  if (path.startsWith('/admin') && role !== 'admin')
    return redirectTo('/unauthorized');

  if (path.startsWith('/teams') && role !== 'user')
    return redirectTo('/unauthorized');

  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/teams/:path*'],
};
