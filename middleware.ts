import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isExcluded =
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/verify-access') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/studio-buy-codes') ||
    pathname.startsWith('/api/stripe-webhook') ||
    pathname.startsWith('/_next') ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif)$/.test(pathname)

  if (isExcluded) return NextResponse.next()

  const cookie = request.cookies.get('you-brand-access')
  if (cookie?.value === 'granted') return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/access'
  url.search = `?redirect=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
