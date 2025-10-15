import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

// Use service role client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you can add a secret token here
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.ADMIN_SECRET || "your-secret-here"
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all pending purchases
    const { data: pendingPurchases, error: fetchError } = await supabase
      .from("credit_purchases")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "stripe")

    if (fetchError) {
      console.error("Error fetching pending purchases:", fetchError)
      return NextResponse.json({ error: "Failed to fetch pending purchases" }, { status: 500 })
    }

    if (!pendingPurchases || pendingPurchases.length === 0) {
      return NextResponse.json({ message: "No pending purchases found" })
    }

    const results = []

    for (const purchase of pendingPurchases) {
      try {
        // Verify payment status with Stripe
        const session = await stripe.checkout.sessions.retrieve(purchase.payment_id)

        if (session.payment_status === "paid" && session.status === "complete") {
          // Payment was successful, add credits
          const { error: rpcError } = await supabase.rpc("add_credits", {
            p_organization_id: purchase.organization_id,
            p_amount_usd: purchase.amount_usd,
            p_purchase_id: purchase.id,
          })

          if (rpcError) {
            console.error(`Failed to add credits for purchase ${purchase.id}:`, rpcError)
            results.push({
              purchaseId: purchase.id,
              status: "error",
              error: rpcError.message,
            })
          } else {
            results.push({
              purchaseId: purchase.id,
              sessionId: purchase.payment_id,
              amount: purchase.amount_usd,
              status: "processed",
            })
            console.log(`✅ Processed pending purchase ${purchase.id}: $${purchase.amount_usd}`)
          }
        } else if (session.status === "expired") {
          // Mark as failed
          await supabase
            .from("credit_purchases")
            .update({ status: "failed" })
            .eq("id", purchase.id)

          results.push({
            purchaseId: purchase.id,
            status: "marked_failed",
          })
        } else {
          results.push({
            purchaseId: purchase.id,
            status: "still_pending",
            stripeStatus: session.status,
          })
        }
      } catch (error) {
        console.error(`Error processing purchase ${purchase.id}:`, error)
        results.push({
          purchaseId: purchase.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: "Processing complete",
      totalPending: pendingPurchases.length,
      results,
    })
  } catch (error) {
    console.error("Process pending error:", error)
    return NextResponse.json(
      { error: "Failed to process pending purchases" },
      { status: 500 }
    )
  }
}
