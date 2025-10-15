import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AccountXConnection } from "@/components/account-x-connection"
import { SettingsForm } from "@/components/settings-form"
import { UsageDashboard } from "@/components/usage-dashboard"
import { ApiKeysManager } from "@/components/api-keys-manager"
import { ApiKeysList } from "@/components/api-keys-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsPageProps {
  searchParams: Promise<{
    connected?: string
    media_connected?: string
  }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { connected, media_connected } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user data including settings
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if user has X connected (include OAuth 1.0a tokens)
  const { data: xIdentity } = await supabase
    .from("identities")
    .select("id, provider_user, expires_at, oauth1a_token, oauth1a_secret")
    .eq("user_id", user.id)
    .eq("provider", "x")
    .single()

  const userSettings = (userData?.settings as any) || {}

  // Get user's organization (for usage data)
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  // Get credit balance
  let creditBalance = null
  let recentGenerations: any[] = []
  let recentPurchases: any[] = []
  
  if (membership?.organization_id) {
    const { data: balance } = await supabase
      .from("credit_balances")
      .select("*")
      .eq("organization_id", membership.organization_id)
      .single()
    
    creditBalance = balance

    // Get recent generations
    const { data: generations } = await supabase
      .from("generation_logs")
      .select("*")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false })
      .limit(20)
    
    recentGenerations = generations || []

    // Get recent purchases
    const { data: purchases } = await supabase
      .from("credit_purchases")
      .select("*")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false })
      .limit(10)
    
    recentPurchases = purchases || []
  }

  // Get all projects the user has access to (with their API keys)
  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)

  const organizationIds = memberships?.map(m => m.organization_id) || []
  
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, organization_id")
    .in("organization_id", organizationIds)
    .order("name", { ascending: true })

  // Get API keys for all projects
  const projectsWithKeys = await Promise.all(
    (projects || []).map(async (project) => {
      const { data: keysData, error: keysError } = await supabase
        .from("api_keys")
        .select("id, name, key_preview, last_used_at, created_at, expires_at")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        
      // Transform data to match expected types - filter out entries with null created_at
      const keys = (keysData || [])
        .filter((key) => key.created_at !== null)
        .map((key) => ({
          ...key,
          created_at: key.created_at as string, // Safe cast since we filtered nulls
        }))
        
      console.log(`[catchy] API Keys for ${project.name}:`, keys.length, "Error:", keysError)

      const membership = memberships?.find(m => m.organization_id === project.organization_id)
      
      return {
        ...project,
        keys,
        canManage: membership?.role === "owner" || membership?.role === "admin"
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      <NavHeader user={{ email: user.email, name: user.user_metadata?.name }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and connections</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="usage">Credits & Usage</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            {/* Profile and Content Settings */}
            <SettingsForm
              user={{
                name: userData?.name || "",
                email: user.email || "",
                settings: userSettings,
              }}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Connected Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your social media connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AccountXConnection 
                    xIdentity={xIdentity} 
                    showSuccessMessage={connected === "x"}
                    showMediaSuccess={media_connected === "true"}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage">
            {membership?.organization_id ? (
              <UsageDashboard 
                creditBalance={creditBalance} 
                recentGenerations={recentGenerations}
                recentPurchases={recentPurchases}
                organizationId={membership.organization_id}
              />
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground">No organization found. Please create or join an organization first.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            {projectsWithKeys.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a project first to manage API keys.
                  </p>
                  <Button asChild>
                    <Link href="/projects/new">Create Project</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Create New API Key */}
                <ApiKeysManager
                  initialKeys={[]}
                  canManage={memberships?.some(m => ["owner", "admin"].includes(m.role)) || false}
                  projects={projects || []}
                  showProjectSelector={true}
                />

                {/* Existing API Keys by Project */}
                <ApiKeysList projectsWithKeys={projectsWithKeys} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

