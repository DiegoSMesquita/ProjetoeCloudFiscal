import { NextResponse } from 'next/server'

export function middleware(request) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')
  if (isAdminRoute) {
    const isAuth = request.cookies.get('admin_auth')?.value || (typeof window !== 'undefined' && localStorage.getItem('admin_auth'))
    if (!isAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
