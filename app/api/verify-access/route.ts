import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const code = form.get('code') as string
  const redirect = (form.get('redirect') as string) || '/'

  if (code === process.env.ACCESS_CODE) {
    const res = NextResponse.redirect(new URL(redirect, req.url))
    res.cookies.set('you-brand-access', 'granted', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  }

  const url = new URL('/access', req.url)
  url.searchParams.set('error', '1')
  url.searchParams.set('redirect', redirect)
  return NextResponse.redirect(url)
}
