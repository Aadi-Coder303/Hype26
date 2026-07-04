import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { OWNER_EMAILS } from './lib/constants'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 1. Protected Route: /orders
  if (request.nextUrl.pathname.startsWith('/orders') && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', '/orders')
    return NextResponse.redirect(url)
  }

  // 2. Protected Route: /dashboard (Owner only)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const isOwner = session?.user?.email && OWNER_EMAILS.includes(session.user.email)
    if (!isOwner) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/orders', '/orders/:path*', '/dashboard', '/dashboard/:path*'],
}
