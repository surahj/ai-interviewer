import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Middleware processing

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/setup-interview',
    '/interview',
    '/api/interview',
    '/api/profile',
    '/api/credits',
  ];

  // Define auth routes
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Route analysis

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    // Would redirect to login (disabled for debugging)
    // const redirectUrl = new URL('/login', req.url);
    // redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    // return NextResponse.redirect(redirectUrl);
  }

  // If accessing auth routes with session, redirect to dashboard
  if (isAuthRoute && session) {
    // Would redirect to dashboard (disabled for debugging)
    // return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
