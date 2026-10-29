import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withBasePath, withoutBasePath } from './lib/base-path';

export function middleware(request: NextRequest) {
  const pathname = withoutBasePath(request.nextUrl.pathname);
  const hasSessionCookie =
    request.cookies.has('exedy_session') ||
    request.cookies.has('__Host-exedy_session');

  // If visiting root and already authenticated -> go directly to dashboard
  if (pathname === '/' && hasSessionCookie) {
    return NextResponse.redirect(new URL(withBasePath('/admin/dashboard'), request.url));
  }

  // If not authenticated and visiting protected pages or root -> go directly to SSO login
  if (!hasSessionCookie && (pathname === '/' || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL(withBasePath('/auth/login'), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
