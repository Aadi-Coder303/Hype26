import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { OWNER_EMAILS } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user is an owner — redirect to dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && OWNER_EMAILS.includes(user.email)) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
