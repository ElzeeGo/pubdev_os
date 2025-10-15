import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ApiKeysManager } from "@/components/api-keys-manager"
import { NavHeader } from "@/components/nav-header"

export default async function ApiKeysPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, organization:organizations(*)")
    .eq("slug", slug)
    .single()

  if (projectError || !project) {
    redirect("/dashboard")
  }

  // Check membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", project.organization_id)
    .single()

  if (!membership) {
    redirect("/dashboard")
  }

  // Get API keys for this organization (not project-specific)
  const { data: apiKeysData, error: keysError } = await supabase
    .from("api_keys")
    .select("id, name, key_preview, last_used_at, created_at, expires_at, project_id")
    .eq("organization_id", project.organization_id)
    .order("created_at", { ascending: false })

  // Transform data to match expected types - filter out entries with null created_at
  const apiKeys = (apiKeysData || [])
    .filter((key) => key.created_at !== null)
    .map((key) => ({
      ...key,
      created_at: key.created_at as string, // Safe cast since we filtered nulls
    }))

  console.log("[catchy] API Keys fetched:", apiKeys.length, "Error:", keysError)

  return (
    <div>
      <NavHeader user={{ email: user.email || '', name: user.user_metadata?.name || null }} />
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="mt-2 text-muted-foreground">
            Manage API keys for {project.name}
          </p>
        </div>

        <ApiKeysManager 
          projectId={project.id} 
          projectSlug={slug}
          initialKeys={apiKeys} 
          canManage={["owner", "admin"].includes(membership.role)}
        />
      </div>
    </div>
  )
}

