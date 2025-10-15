"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Plus, Zap } from "lucide-react"
import { CreditPackages } from "./credit-packages"

interface CreditBalance {
  balance_usd: number
  total_purchased_usd: number | null
  total_spent_usd: number | null
}

interface DashboardCreditsProps {
  creditBalance: CreditBalance | null
  organizationId: string
}

export function DashboardCredits({ creditBalance, organizationId }: DashboardCreditsProps) {
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false)

  const balanceColor = creditBalance && creditBalance.balance_usd > 10
    ? "text-green-600 dark:text-green-400"
    : creditBalance && creditBalance.balance_usd > 1
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400"

  return (
    <div className="mb-12">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Credit Balance
              </CardTitle>
              <CardDescription>Your current credit balance and usage</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-3xl font-bold ${balanceColor}`}>
                  ${creditBalance?.balance_usd?.toFixed(2) || "0.00"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(creditBalance?.total_spent_usd || 0).toFixed(2)} spent of ${(creditBalance?.total_purchased_usd || 0).toFixed(2)} purchased
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => setShowPurchaseOptions(!showPurchaseOptions)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {showPurchaseOptions ? "Hide" : "Buy Credits"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {showPurchaseOptions && (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Purchase Credits</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Choose a credit package to power your content generation
          </p>
          <CreditPackages organizationId={organizationId} />
        </div>
      )}
    </div>
  )
}

