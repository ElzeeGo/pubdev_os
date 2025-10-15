"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"
import { CreditPurchaseButton } from "./credit-purchase-button"

interface CreditPackagesProps {
  organizationId: string
}

export function CreditPackages({ organizationId }: CreditPackagesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Starter Credits */}
      <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Starter</CardTitle>
          <CardDescription className="text-muted-foreground">
            Perfect for trying out
          </CardDescription>
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">$4.99</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">$4.99 in credits</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~500 text generations</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~40 images</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Credits never expire</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <CreditPurchaseButton
            packageType="starter"
            organizationId={organizationId}
            amount={4.99}
            label="Purchase $4.99"
            variant="outline"
            className="w-full border-border/50"
          />
        </CardFooter>
      </Card>

      {/* Professional Credits */}
      <Card className="relative bg-card/50 border-2 border-primary/50 backdrop-blur-sm">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">Popular</Badge>
        </div>
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-bold">Professional</CardTitle>
          <CardDescription className="text-muted-foreground">
            Best value for regular use
          </CardDescription>
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">$50</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">$50 in credits</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~5,000 text generations</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~417 images</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Credits never expire</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Best value</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <CreditPurchaseButton
            packageType="professional"
            organizationId={organizationId}
            amount={50}
            label="Purchase $50"
            className="w-full bg-primary hover:bg-primary/90"
          />
        </CardFooter>
      </Card>

      {/* Enterprise Credits */}
      <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
          <CardDescription className="text-muted-foreground">For teams & heavy usage</CardDescription>
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">$200</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">$200 in credits</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~20,000 text generations</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">~1,667 images</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">Credits never expire</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Maximum value</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <CreditPurchaseButton
            packageType="enterprise"
            organizationId={organizationId}
            amount={200}
            label="Purchase $200"
            variant="outline"
            className="w-full border-border/50"
          />
        </CardFooter>
      </Card>
    </div>
  )
}

