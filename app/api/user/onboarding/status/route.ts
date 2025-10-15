import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's onboarding status
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching onboarding status:", profileError)
      return NextResponse.json(
        { error: "Failed to fetch onboarding status" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      onboarding_completed: profile?.onboarding_completed || false 
    })
  } catch (error) {
    console.error("Error in onboarding status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

