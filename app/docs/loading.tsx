import { Card, CardHeader } from "@/components/ui/card"

export default function DocsLoading() {
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <div className="h-10 w-96 bg-muted animate-pulse rounded mb-4" />
            <div className="h-6 w-full max-w-2xl bg-muted animate-pulse rounded mb-6" />
            <div className="flex gap-3">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-8 h-8 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-48 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

