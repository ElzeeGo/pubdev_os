import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DashboardCredits } from "@/components/dashboard-credits"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's organizations with minimal data
  const { data: organizations } = await supabase
    .from("organizations")
    .select(`
      id,
      name,
      memberships!inner (
        id,
        role,
        user_id
      )
    `)
    .eq("memberships.user_id", user.id)

  // Check if user needs to create an organization
  if (!organizations || organizations.length === 0) {
    redirect("/auth/setup-organization")
  }

  // Fetch credit balance for the first organization (primary)
  const primaryOrg = organizations[0]
  const { data: creditBalance } = await supabase
    .from("credit_balances")
    .select("balance_usd, total_purchased_usd, total_spent_usd")
    .eq("organization_id", primaryOrg.id)
    .single()

  // Fetch projects with counts separately for better performance
  const organizationIds = organizations.map((org) => org.id)
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      slug,
      organization_id
    `)
    .in("organization_id", organizationIds)

  const projects = projectsData || []

  // Fetch draft counts only if we have projects
  let draftCounts: Array<{ project_id: string }> = []
  if (projects.length > 0) {
    const { data: draftCountsData } = await supabase
      .from("drafts")
      .select("project_id")
      .in("project_id", projects.map((p) => p.id))
    
    draftCounts = draftCountsData || []
  }

  // Fetch post counts only if we have projects
  let postCounts: Array<{ project_id: string }> = []
  if (projects.length > 0) {
    const { data: postCountsData } = await supabase
      .from("posts")
      .select("project_id")
      .in("project_id", projects.map((p) => p.id))
    
    postCounts = postCountsData || []
  }

  // Build count maps
  const draftCountMap = draftCounts.reduce((acc: Record<string, number>, draft) => {
    acc[draft.project_id] = (acc[draft.project_id] || 0) + 1
    return acc
  }, {})

  const postCountMap = postCounts.reduce((acc: Record<string, number>, post) => {
    acc[post.project_id] = (acc[post.project_id] || 0) + 1
    return acc
  }, {})

  // Combine data into expected structure
  const organizationsWithProjects = organizations.map((org) => ({
    ...org,
    projects: projects
      .filter((p) => p.organization_id === org.id)
      .map((p) => ({
        ...p,
        draftsCount: draftCountMap[p.id] || 0,
        postsCount: postCountMap[p.id] || 0,
      })),
  }))

  return (
    <div className="min-h-screen bg-background">
      <NavHeader user={{ email: user.email, name: user.user_metadata?.name }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your projects and drafts</p>
          </div>
        </div>

        {/* Credit Balance Section */}
        <DashboardCredits 
          creditBalance={creditBalance} 
          organizationId={primaryOrg.id} 
        />

        {/* Projects Section */}
        {organizationsWithProjects.map((org) => (
          <div key={org.id} className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{org.name}</h2>
              <Button asChild>
                <Link href={`/projects/new?org=${org.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>

            {org.projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-muted-foreground">No projects yet</p>
                  <Button asChild>
                    <Link href={`/projects/new?org=${org.id}`}>Create your first project</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {org.projects.map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.slug}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>/{project.slug}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{project.draftsCount} drafts</span>
                          <span>{project.postsCount} posts</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
