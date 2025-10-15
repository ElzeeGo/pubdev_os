import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, email, name, settings")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("[catchy] Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, settings } = body

    const updateData: {
      name?: string
      settings?: any
      updated_at: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (settings !== undefined) {
      updateData.settings = settings
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error

    // Also update the user metadata in auth if name changed
    if (name !== undefined) {
      await supabase.auth.updateUser({
        data: { name },
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[catchy] Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

