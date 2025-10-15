import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

async function SuccessContent({ sessionId }: { sessionId: string | null }) {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get user's organization
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, organizations(name)")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase! Your credits are now available and ready to use.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Transaction ID: {sessionId.slice(0, 20)}...
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {membership && (
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function StripeSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent sessionId={searchParams.session_id || null} />
    </Suspense>
  )
}

