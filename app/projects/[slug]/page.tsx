import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus } from "lucide-react"

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // First, verify project access and get basic info
  const { data: project } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      slug,
      organization_id,
      organization:organizations!inner (
        id,
        name,
        memberships!inner (
          role,
          user_id
        )
      )
    `)
    .eq("slug", slug)
    .eq("organization.memberships.user_id", user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

  // Fetch drafts separately with only needed fields
  const { data: drafts = [] } = await supabase
    .from("drafts")
    .select(`
      id,
      context,
      status,
      created_at,
      creator:users!created_by (
        id,
        name,
        email
      )
    `)
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch posts separately with only needed fields
  const { data: posts = [] } = await supabase
    .from("posts")
    .select(`
      id,
      text,
      status,
      permalink,
      created_at,
      creator:users!created_by (
        id,
        name,
        email
      )
    `)
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Combine data back into expected structure
  const projectData = {
    ...project,
    drafts,
    posts,
  }

  const membership = projectData.organization.memberships[0]

  return (
    <div className="min-h-screen bg-background">
      <NavHeader user={{ email: user.email, name: user.user_metadata?.name }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{projectData.name}</h1>
            <p className="text-muted-foreground">/{projectData.slug}</p>
          </div>
        </div>

        <Tabs defaultValue="drafts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="posts">Published</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="space-y-4">
            <div className="flex justify-end">
              <Button asChild>
                <Link href={`/projects/${slug}/drafts/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Draft
                </Link>
              </Button>
            </div>

            {!projectData.drafts || projectData.drafts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-muted-foreground">No drafts yet</p>
                  <Button asChild>
                    <Link href={`/projects/${slug}/drafts/new`}>Create your first draft</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projectData.drafts?.map((draft) => (
                  <Link key={draft.id} href={`/drafts/${draft.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {(draft.context as { title?: string })?.title || "Untitled Draft"}
                            </CardTitle>
                            <CardDescription>
                              Created by {draft.creator.name || draft.creator.email} •{" "}
                              {new Date(draft.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              draft.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : draft.status === "published"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {draft.status}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {!projectData.posts || projectData.posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No published posts yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projectData.posts?.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardDescription className="mb-2">
                            Published by {post.creator.name || post.creator.email} •{" "}
                            {new Date(post.created_at).toLocaleDateString()}
                          </CardDescription>
                          <p className="text-sm">{post.text}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : post.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View on X →
                        </a>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
