import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // The Supabase middleware/client automatically handles PKCE code exchange via cookies
    // Just verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user after OAuth callback:', userError)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if this is a new user or if they need to complete onboarding
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    // If no profile exists or onboarding not completed, redirect to setup
    if (!profile || !profile.onboarding_completed) {
      return NextResponse.redirect(`${origin}/auth/setup-organization`)
    }

    // Successful login - redirect to the requested page
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}

