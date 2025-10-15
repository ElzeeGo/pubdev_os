import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

// Credit packages with pricing
const CREDIT_PACKAGES = {
  starter: {
    amount: 4.99,
    name: "Starter Package",
    description: "Perfect for trying out - ~500 text generations, ~40 images",
  },
  professional: {
    amount: 50,
    name: "Professional Package",
    description: "Best value for regular use - ~5,000 text generations, ~417 images",
  },
  enterprise: {
    amount: 200,
    name: "Enterprise Package",
    description: "For teams & heavy usage - ~20,000 text generations, ~1,667 images",
  },
} as const

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { packageType, organizationId } = body as {
      packageType: keyof typeof CREDIT_PACKAGES
      organizationId: string
    }

    // Validate package type
    if (!CREDIT_PACKAGES[packageType]) {
      return NextResponse.json({ error: "Invalid package type" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is member of organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
    }

    const package_ = CREDIT_PACKAGES[packageType]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Get organization details
    const { data: orgData } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single()

    // Try to get existing customer ID (after migration is run)
    let customerId = orgData?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: orgData?.name || user.email,
        metadata: {
          organization_id: organizationId,
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to organization
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", organizationId)
      
      if (updateError) {
        console.warn("Failed to save stripe_customer_id:", updateError)
      } else {
        console.log("Saved Stripe customer ID")
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customerId,
      customer_update: {
        address: "auto", // Collect address for VAT
        name: "auto",
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: package_.name,
              description: package_.description,
            },
            unit_amount: package_.amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      // Allow promotion codes to be entered at checkout
      allow_promotion_codes: true,
      // Enable tax collection (requires Stripe Tax to be enabled in dashboard)
      automatic_tax: {
        enabled: true,
      },
      // Collect tax ID (VAT number) for businesses
      tax_id_collection: {
        enabled: true,
      },
      // Enable invoice creation
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${package_.name} - Credits for PubDev`,
          metadata: {
            organization_id: organizationId,
            package_type: packageType,
          },
          footer: "Thank you for your business! Credits will be added to your account immediately.",
        },
      },
      success_url: `${appUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/stripe/cancel`,
      metadata: {
        organizationId,
        userId: user.id,
        packageType,
        creditAmount: package_.amount.toString(),
      },
    })

    // Create pending purchase record
    await supabase.from("credit_purchases").insert({
      organization_id: organizationId,
      amount_usd: package_.amount,
      payment_method: "stripe",
      payment_id: session.id,
      status: "pending",
      notes: `${package_.name} purchase`,
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

