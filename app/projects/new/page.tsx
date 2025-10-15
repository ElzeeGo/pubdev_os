"use client"

import type React from "react"

import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewProjectPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get("org")

  useEffect(() => {
    // Fetch current user for nav
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, organizationId: orgId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create project")
      }

      const { project } = await response.json()
      router.push(`/projects/${project.slug}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <NavHeader user={user} />}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create new project</CardTitle>
              <CardDescription>Set up a new project to start publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="My Awesome Project"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this project about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create project"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
