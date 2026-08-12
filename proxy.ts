// middleware.ts
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
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Public routes: QR scan landing pages are accessible without any login
  // so participants can see their clues by scanning a physical QR code.
  const isPublicQrPage = /^\/teams\/[^\/]+\/qr\/[^\/]+/.test(path);
  if (isPublicQrPage) return res;

  if (!user) {
    if (path === '/login' || path === '/') return res;
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Profile details fetched from cookies instead of database lookup
  const role = req.cookies.get('user_role')?.value;
  const username = req.cookies.get('user_name')?.value;

  // Auto-redirect logged-in users away from /login and /
  if ((path === '/login' || path === '/') && role) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
    if (role === 'user' && username) return NextResponse.redirect(new URL(`/teams/${username}`, req.url));
  }

  // Strict 1:1 Role Routing
  if (path.startsWith('/admin') && role !== 'admin')
    return NextResponse.redirect(new URL('/unauthorized', req.url));
    
  if (path.startsWith('/teams') && role !== 'user')
    return NextResponse.redirect(new URL('/unauthorized', req.url));

  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/teams/:path*'],
};