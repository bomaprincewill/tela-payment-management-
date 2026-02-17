import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAME = 'tela_auth'
const AUTH_COOKIE_VALUE = 'allowed'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const isAuthenticated = authCookie === AUTH_COOKIE_VALUE

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/outstanding-balances')
  ) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname === '/login' && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/outstanding-balances/:path*']
}
