import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user has access to this purchase
    const { data: purchase } = await supabase
      .from("credit_purchases")
      .select("*, organizations!inner(id)")
      .eq("payment_id", sessionId)
      .single()

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Verify user is member of the organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", purchase.organization_id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'invoice']
    })

    // Priority 1: Check for proper invoice (with tax/VAT support)
    if (session.invoice) {
      const invoice = typeof session.invoice === 'string' 
        ? await stripe.invoices.retrieve(session.invoice)
        : session.invoice as Stripe.Invoice
      
      // Calculate total tax - use amount_paid - subtotal to get tax amount
      const subtotal = (invoice as any).subtotal || 0
      const totalTax = invoice.amount_paid - subtotal
      
      return NextResponse.json({
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        invoiceNumber: invoice.number,
        status: invoice.status,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        taxAmount: totalTax / 100,
        customerTaxIds: (invoice as any).customer_tax_ids || [],
        hasVat: ((invoice as any).customer_tax_ids?.length || 0) > 0,
      })
    }

    // Priority 2: For one-time payments without invoice_creation enabled
    // Fall back to receipt from charge object
    if (session.payment_intent) {
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent
      
      if (paymentIntent.latest_charge) {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string)
        
        return NextResponse.json({
          invoiceUrl: charge.receipt_url,
          receiptNumber: charge.receipt_number,
          status: charge.status,
          amount: charge.amount / 100,
          currency: charge.currency.toUpperCase(),
          hasVat: false,
          isReceipt: true, // Flag to indicate this is a receipt, not a full invoice
        })
      }
    }

    return NextResponse.json({ error: "No invoice or receipt available" }, { status: 404 })
  } catch (error) {
    console.error("Invoice retrieval error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve invoice" },
      { status: 500 }
    )
  }
}

