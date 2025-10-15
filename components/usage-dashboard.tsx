"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Image, DollarSign, TrendingUp, Clock, Plus, Download, ExternalLink, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { format } from "date-fns"
import { CreditPackages } from "./credit-packages"
import { useState } from "react"

interface CreditBalance {
  balance_usd: number
  total_purchased_usd: number | null
  total_spent_usd: number | null
  total_generations: number | null
  total_tokens: number | null
  total_images: number | null
}

interface GenerationLog {
  id: string
  type: string
  model: string
  duration_ms: number
  total_tokens: number | null
  images_generated: number | null
  cost_usd: number
  status: string
  created_at: string | null
}

interface CreditPurchase {
  id: string
  amount_usd: number
  payment_method: string | null
  payment_id: string | null
  status: string
  notes: string | null
  created_at: string | null
  completed_at: string | null
}

interface UsageDashboardProps {
  creditBalance: CreditBalance | null
  recentGenerations: GenerationLog[]
  recentPurchases?: CreditPurchase[]
  organizationId: string
}

export function UsageDashboard({ creditBalance, recentGenerations, recentPurchases, organizationId }: UsageDashboardProps) {
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false)
  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null)

  async function handleViewInvoice(sessionId: string) {
    try {
      setLoadingInvoice(sessionId)
      const response = await fetch(`/api/stripe/invoice?session_id=${sessionId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch invoice")
      }

      const data = await response.json()
      
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, "_blank")
        
        // Show helpful message for receipts vs invoices
        if (data.isReceipt) {
          // Optional: You could show a toast notification here
          console.info("This is a payment receipt. For VAT invoices, ensure tax information is collected during checkout.")
        }
      } else {
        alert("Invoice not available for this purchase")
      }
    } catch (error) {
      console.error("Invoice error:", error)
      alert("Failed to retrieve invoice. Please try again.")
    } finally {
      setLoadingInvoice(null)
    }
  }

  if (!creditBalance) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No usage data available</p>
      </Card>
    )
  }

  const balanceColor = creditBalance.balance_usd > 10
    ? "text-green-600 dark:text-green-400"
    : creditBalance.balance_usd > 1
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400"

  return (
    <div className="space-y-6">
      {/* Credit Balance */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Credit Balance</h3>
            <p className={`mt-2 text-3xl font-bold ${balanceColor}`}>
              ${creditBalance.balance_usd.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ${(creditBalance.total_spent_usd || 0).toFixed(2)} spent of ${(creditBalance.total_purchased_usd || 0).toFixed(2)} purchased
            </p>
          </div>
          <Button size="lg" onClick={() => setShowPurchaseOptions(!showPurchaseOptions)}>
            <Plus className="mr-2 h-4 w-4" />
            Buy Credits
          </Button>
        </div>
      </Card>

      {/* Purchase Options */}
      {showPurchaseOptions && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Choose a credit package</h3>
          <CreditPackages organizationId={organizationId} />
        </div>
      )}

      {/* Lifetime Usage Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Generations */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Total Generations</h4>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold">{creditBalance.total_generations || 0}</span>
            <p className="mt-1 text-xs text-muted-foreground">All-time</p>
          </div>
        </Card>

        {/* Tokens */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold">Total Tokens</h4>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold">
              {((creditBalance.total_tokens || 0) / 1000).toFixed(1)}k
            </span>
            <p className="mt-1 text-xs text-muted-foreground">All-time</p>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-500" />
            <h4 className="font-semibold">Total Images</h4>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold">{creditBalance.total_images || 0}</span>
            <p className="mt-1 text-xs text-muted-foreground">All-time</p>
          </div>
        </Card>
      </div>

      {/* Purchase History */}
      {recentPurchases && recentPurchases.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase History
          </h3>
          {recentPurchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchases yet</p>
        ) : (
          <div className="space-y-3">
            {recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      purchase.status === "completed" 
                        ? "default" 
                        : purchase.status === "refunded" 
                        ? "destructive" 
                        : "secondary"
                    }
                  >
                    {purchase.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      ${purchase.amount_usd.toFixed(2)} Credit Purchase
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.created_at && format(new Date(purchase.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {purchase.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{purchase.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {purchase.status === "completed" && purchase.payment_id && purchase.payment_method === "stripe" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(purchase.payment_id!)}
                      disabled={loadingInvoice === purchase.payment_id}
                    >
                      {loadingInvoice === purchase.payment_id ? (
                        <>
                          <Clock className="mr-2 h-3 w-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-3 w-3" />
                          View Invoice
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </Card>
      )}

      {/* Recent Generations */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Generations</h3>
        {recentGenerations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No generations yet</p>
        ) : (
          <div className="space-y-3">
            {recentGenerations.slice(0, 10).map((gen) => (
              <div
                key={gen.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={gen.status === "completed" ? "default" : "destructive"}>
                    {gen.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{gen.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {gen.created_at && formatDistanceToNow(new Date(gen.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {(gen.duration_ms / 1000).toFixed(1)}s
                  </div>
                  {(gen.total_tokens || 0) > 0 && (
                    <div className="text-muted-foreground">
                      {gen.total_tokens} tokens
                    </div>
                  )}
                  {(gen.images_generated || 0) > 0 && (
                    <div className="text-muted-foreground">
                      {gen.images_generated} images
                    </div>
                  )}
                  <div className="font-medium">
                    ${gen.cost_usd.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

