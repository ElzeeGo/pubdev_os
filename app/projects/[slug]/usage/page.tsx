import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { UsageDashboard } from "@/components/usage-dashboard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function UsagePage({ params }: { params: { slug: string } }) {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, organization:organizations(*)")
    .eq("slug", params.slug)
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

  // Get credit balance
  const { data: creditBalance } = await supabase
    .from("credit_balances")
    .select("*")
    .eq("organization_id", project.organization_id)
    .single()

  // Get recent generations
  const { data: recentGenerations } = await supabase
    .from("generation_logs")
    .select("*")
    .eq("organization_id", project.organization_id)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get recent purchases
  const { data: recentPurchases } = await supabase
    .from("credit_purchases")
    .select("*")
    .eq("organization_id", project.organization_id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/projects/${params.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to project
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Credits & Usage</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your credits and track AI generation usage
        </p>
      </div>

      <UsageDashboard 
        creditBalance={creditBalance} 
        recentGenerations={recentGenerations || []}
        recentPurchases={recentPurchases || []}
        organizationId={project.organization_id}
      />
    </div>
  )
}

