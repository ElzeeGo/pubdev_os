import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use service role client for webhook operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const { organizationId, creditAmount } = session.metadata || {}

        if (!organizationId || !creditAmount) {
          console.error("Missing metadata in checkout session:", session.id)
          return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
        }

        const amount = parseFloat(creditAmount)

        // Get the purchase record
        const { data: purchase } = await supabase
          .from("credit_purchases")
          .select("id")
          .eq("payment_id", session.id)
          .single()

        if (!purchase) {
          console.error("Purchase record not found:", session.id)
          // Create purchase record if it doesn't exist
          const { data: newPurchase } = await supabase
            .from("credit_purchases")
            .insert({
              organization_id: organizationId,
              amount_usd: amount,
              payment_method: "stripe",
              payment_id: session.id,
              status: "pending",
              notes: "Stripe webhook - session completed",
            })
            .select("id")
            .single()

          if (!newPurchase) {
            console.error("Failed to create purchase record")
            return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 })
          }

          // Use the new purchase ID
          await addCreditsToOrganization(organizationId, amount, newPurchase.id)
        } else {
          // Add credits using existing purchase ID
          await addCreditsToOrganization(organizationId, amount, purchase.id)
        }

        console.log(`✅ Credits added: $${amount} to org ${organizationId}`)
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session

        // Mark purchase as failed
        await supabase
          .from("credit_purchases")
          .update({ status: "failed" })
          .eq("payment_id", session.id)

        console.log(`❌ Checkout session expired: ${session.id}`)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge

        // Find the session from the charge
        if (charge.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            charge.payment_intent as string
          )

          // Find purchase by payment intent metadata or session
          const { data: purchase } = await supabase
            .from("credit_purchases")
            .select("*")
            .eq("payment_id", paymentIntent.id)
            .single()

          if (purchase) {
            // Mark as refunded
            await supabase
              .from("credit_purchases")
              .update({ status: "refunded" })
              .eq("id", purchase.id)

            // Deduct credits (negative amount)
            // Get current balance first
            const { data: currentBalance } = await supabase
              .from("credit_balances")
              .select("balance_usd")
              .eq("organization_id", purchase.organization_id)
              .single()
            
            if (currentBalance) {
              await supabase
                .from("credit_balances")
                .update({
                  balance_usd: currentBalance.balance_usd - purchase.amount_usd,
                  updated_at: new Date().toISOString(),
                })
                .eq("organization_id", purchase.organization_id)
            }

            console.log(`💸 Refund processed: $${purchase.amount_usd} from org ${purchase.organization_id}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// Helper function to add credits using the SQL function
async function addCreditsToOrganization(
  organizationId: string,
  amount: number,
  purchaseId: string
) {
  const { error } = await supabase.rpc("add_credits", {
    p_organization_id: organizationId,
    p_amount_usd: amount,
    p_purchase_id: purchaseId,
  })

  if (error) {
    console.error("Failed to add credits:", error)
    throw error
  }
}

