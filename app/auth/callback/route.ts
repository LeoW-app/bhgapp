import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user already has a household
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: membership } = await supabase
          .from('memberships')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        return NextResponse.redirect(`${origin}${membership ? '/today' : '/setup'}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=1`)
}
