import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Skip authentication for API routes that use Bearer token auth
  const isPublicApiRoute = 
    request.nextUrl.pathname.startsWith("/api/v1") ||
    request.nextUrl.pathname.startsWith("/api/health") ||
    request.nextUrl.pathname.startsWith("/api/oauth")
  
  if (isPublicApiRoute) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Handle OAuth callback - exchange code for session
  if (request.nextUrl.pathname === "/auth/callback") {
    const code = request.nextUrl.searchParams.get("code")
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated and trying to access protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/health") &&
    !request.nextUrl.pathname.startsWith("/docs") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated and trying to access login/signup
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Check if authenticated user needs to complete onboarding
  // Allow /auth/* paths (like /auth/setup-organization) to proceed without onboarding check
  if (
    user && 
    !request.nextUrl.pathname.startsWith("/onboarding") && 
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
