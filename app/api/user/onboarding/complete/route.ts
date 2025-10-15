import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { teamSize, howFoundUs, role, companyName, primaryUseCase } = body

    // Update user's onboarding status and data
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        team_size: teamSize,
        how_found_us: howFoundUs,
        role: role,
        company_name: companyName,
        primary_use_case: primaryUseCase,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating onboarding status:", updateError)
      return NextResponse.json(
        { error: "Failed to complete onboarding" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in onboarding complete:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

