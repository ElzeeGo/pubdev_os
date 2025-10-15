import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XConnectionCard } from "@/components/x-connection-card"
import Link from "next/link"
import { ArrowLeft, Settings, Key } from "lucide-react"

interface SettingsPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    connected?: string
  }>
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { slug } = await params
  const { connected } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      organization:organizations (
        *,
        memberships!inner (*)
      )
    `)
    .eq("slug", slug)
    .eq("organization.memberships.user_id", user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

  // Check if user has X connected
  const { data: xIdentity } = await supabase
    .from("identities")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "x")
    .single()

  const settings = project.settings as {
    tone?: string
    language?: string
    audience?: string
    hashtags?: string[]
    imageMode?: string
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader user={{ email: user.email, name: user.user_metadata?.name }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/projects/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to project
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
          {/* Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <XConnectionCard
                projectSlug={slug}
                xIdentity={xIdentity}
                showSuccessMessage={connected === "x"}
              />
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>Configure how your content is generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="tone">Tone</Label>
                <Select defaultValue={settings.tone || "professional"}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input id="audience" defaultValue={settings.audience || "developers"} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hashtags">Default Hashtags</Label>
                <Textarea
                  id="hashtags"
                  placeholder="#tech #coding"
                  defaultValue={settings.hashtags?.join(" ") || ""}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image-mode">Image Generation</Label>
                <Select defaultValue={settings.imageMode || "auto"}>
                  <SelectTrigger id="image-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="always">Always Generate</SelectItem>
                    <SelectItem value="never">Never Generate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="api-keys" className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">API Keys</h3>
          <p className="text-muted-foreground mb-4">
            Manage API keys to connect the pubdev package to your project
          </p>
          <Button asChild>
            <Link href={`/projects/${slug}/api-keys`}>
              <Key className="mr-2 h-4 w-4" />
              Manage API Keys
            </Link>
          </Button>
        </div>
      </TabsContent>

      </Tabs>
      </main>
    </div>
  )
}
