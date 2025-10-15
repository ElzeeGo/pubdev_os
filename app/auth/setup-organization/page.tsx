"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SetupOrganizationPage() {
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.error("No active session:", sessionError)
          setError("You must be logged in to create an organization. Redirecting to login...")
          setTimeout(() => router.push("/login"), 2000)
          return
        }
        
        setIsCheckingAuth(false)
      } catch (err) {
        console.error("Auth check error:", err)
        setError("Authentication check failed. Redirecting to login...")
        setTimeout(() => router.push("/login"), 2000)
      }
    }
    
    checkAuth()
  }, [router])

  // Auto-generate slug from organization name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setOrgName(name)
    setOrgSlug(generateSlug(name))
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!orgSlug || orgSlug.trim().length === 0) {
      setError("Organization slug is required")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: orgName,
          slug: orgSlug 
        }),
      })

      if (!response.ok) {
        // Try to parse JSON response, fall back to text if it fails
        let errorMessage = "Failed to create organization"
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (jsonError) {
          // Response is not JSON, try to get text
          const text = await response.text()
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      console.error("Organization creation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Checking authentication...</CardTitle>
              <CardDescription>Please wait while we verify your session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Setup your organization</CardTitle>
            <CardDescription>Create your first organization to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    type="text"
                    placeholder="My Company"
                    required
                    value={orgName}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="org-slug">Organization Slug</Label>
                  <Input
                    id="org-slug"
                    type="text"
                    placeholder="my-company"
                    required
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(generateSlug(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Lowercase letters, numbers, and hyphens only.
                  </p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create organization"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
