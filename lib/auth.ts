import { createClient as createServerClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserWithOrganizations(userId: string) {
  const supabase = await createServerClient()
  
  const { data: user } = await supabase
    .from("users")
    .select(`
      *,
      memberships (
        *,
        organization:organizations (
          *,
          projects (*)
        )
      )
    `)
    .eq("id", userId)
    .single()
  
  return user
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
