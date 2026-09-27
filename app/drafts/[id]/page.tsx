import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { DraftVariantSelector } from "@/components/draft-variant-selector"
import { ImageGallery } from "@/components/image-gallery"
import { VideoGallery } from "@/components/video-gallery"

interface DraftPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DraftPage({ params }: DraftPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch draft with access verification
  const { data: draft } = await supabase
    .from("drafts")
    .select(`
      id,
      context,
      variants,
      images,
      videos,
      status,
      created_at,
      created_by,
      project:projects!inner (
        id,
        name,
        slug,
        organization:organizations!inner (
          id,
          name,
          memberships!inner (
            role,
            user_id
          )
        )
      ),
      creator:users!created_by (
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .eq("project.organization.memberships.user_id", user.id)
    .single()

  if (!draft) {
    redirect("/dashboard")
  }

  // Fetch related posts separately
  const { data: postsData } = await supabase
    .from("posts")
    .select(`
      id,
      text,
      status,
      permalink,
      error,
      created_at,
      creator:users!created_by (
        id,
        name,
        email
      )
    `)
    .eq("draft_id", id)
    .order("created_at", { ascending: false })

  const posts = postsData || []

  // Combine data (cast to any to work around outdated TypeScript types)
  const draftWithPosts: any = Object.assign({}, draft, { posts })

  const context = draftWithPosts.context as Record<string, any>
  const variants = draftWithPosts.variants as string[]
  const images = draftWithPosts.images as Array<{ prompt: string; url?: string }> | null
  const videos = draftWithPosts.videos as any
  const membership = draftWithPosts.project?.organization?.memberships?.[0]
  
  if (!membership) {
    redirect("/dashboard")
  }
  
  const canPublish = membership.role === "owner" || membership.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <NavHeader user={{ email: user.email, name: user.user_metadata?.name }} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/projects/${draftWithPosts.project.slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to project
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{context.title || "Draft Preview"}</h1>
              <p className="text-muted-foreground">
                Created by {draftWithPosts.creator?.name || draftWithPosts.creator?.email || "Unknown"} on{" "}
                {new Date(draftWithPosts.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                draftWithPosts.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : draftWithPosts.status === "published"
                    ? "bg-blue-100 text-blue-800"
                    : draftWithPosts.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {draftWithPosts.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Context */}
          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
              <CardDescription>Information used to generate this draft</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {context.title && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-sm">{context.title}</p>
                </div>
              )}
              {context.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{context.description}</p>
                </div>
              )}
              {context.repository && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Repository</p>
                  <p className="text-sm">{context.repository}</p>
                </div>
              )}
              {context.changes && Array.isArray(context.changes) && context.changes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Changes</p>
                  <ul className="list-inside list-disc text-sm">
                    {context.changes.map((change: string, i: number) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Variants</CardTitle>
              <CardDescription>Select and customize your post</CardDescription>
            </CardHeader>
            <CardContent>
              <DraftVariantSelector
                draftId={draftWithPosts.id}
                variants={variants}
                images={images || undefined}
                canPublish={canPublish}
                status={draftWithPosts.status}
              />
            </CardContent>
          </Card>
        </div>

        {/* Generated Images */}
        {images && images.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Images</CardTitle>
                <CardDescription>AI-generated images for your post</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageGallery images={images} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generated Videos */}
        {videos && videos.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Videos</CardTitle>
                <CardDescription>AI-generated videos</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoGallery videos={videos} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Published Posts */}
        {draftWithPosts.posts.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Posts</CardTitle>
                <CardDescription>Posts created from this draft</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {draftWithPosts.posts.map((post: any) => (
                    <div key={post.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Published by {post.creator?.name || post.creator?.email || "Unknown"} •{" "}
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
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
                      <p className="mb-2 text-sm">{post.text}</p>
                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:underline"
                        >
                          View on X
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                      {post.error && <p className="mt-2 text-sm text-red-600">Error: {post.error}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
