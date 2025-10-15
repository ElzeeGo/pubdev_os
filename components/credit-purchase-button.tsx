"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CreditPurchaseButtonProps {
  packageType: "starter" | "professional" | "enterprise"
  organizationId: string
  amount: number
  label: string
  variant?: "default" | "outline"
  className?: string
}

export function CreditPurchaseButton({
  packageType,
  organizationId,
  amount,
  label,
  variant = "default",
  className,
}: CreditPurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handlePurchase() {
    try {
      setLoading(true)

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType,
          organizationId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create checkout session")
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error("Purchase error:", error)
      alert(error instanceof Error ? error.message : "Failed to start checkout. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        label
      )}
    </Button>
  )
}

