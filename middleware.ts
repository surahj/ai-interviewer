import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🔍 MIDDLEWARE EXECUTING FOR:', request.nextUrl.pathname);
  
  // Simple test: redirect all requests to /test
  if (request.nextUrl.pathname === '/dashboard') {
    console.log('🔍 REDIRECTING DASHBOARD TO LOGIN');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
