import { Card, CardHeader } from "@/components/ui/card"

export default function HealthLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">pubdev</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-48 bg-muted animate-pulse rounded" />
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-5 w-96 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

