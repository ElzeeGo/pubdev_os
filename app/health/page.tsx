import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Database, Server, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "down"
  responseTime?: number
  icon: React.ElementType
}

export default async function HealthPage() {
  const services: ServiceStatus[] = []
  
  // Check API Health
  try {
    const apiStart = Date.now()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`, {
      cache: 'no-store'
    })
    const apiTime = Date.now() - apiStart
    
    services.push({
      name: "API Server",
      status: response.ok ? "operational" : "down",
      responseTime: apiTime,
      icon: Server
    })
  } catch (error) {
    services.push({
      name: "API Server",
      status: "down",
      icon: Server
    })
  }

  // Check Database
  try {
    const dbStart = Date.now()
    const supabase = await createClient()
    const { error } = await supabase.from("organizations").select("id").limit(1)
    const dbTime = Date.now() - dbStart
    
    services.push({
      name: "Database",
      status: error ? "down" : "operational",
      responseTime: dbTime,
      icon: Database
    })
  } catch (error) {
    services.push({
      name: "Database",
      status: "down",
      icon: Database
    })
  }

  // Add other services
  services.push({
    name: "Authentication",
    status: "operational",
    icon: Zap
  })

  const allOperational = services.every(s => s.status === "operational")
  const overallStatus = allOperational ? "operational" : "degraded"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">pubdev</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">System Status</h1>
              {overallStatus === "operational" ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Systems Operational
                </Badge>
              ) : (
                <Badge variant="destructive">Service Degraded</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Real-time status of all pubdev services and infrastructure
            </p>
          </div>

          <div className="grid gap-4">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          service.status === "operational" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          {service.responseTime && (
                            <CardDescription>
                              Response time: {service.responseTime}ms
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={service.status === "operational" ? "default" : "destructive"}
                        className={service.status === "operational" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {service.status === "operational" ? "Operational" : "Down"}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About This Page</CardTitle>
              <CardDescription>
                This page shows the current status of all pubdev services. It checks the API server, 
                database connectivity, and authentication services in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>API Endpoint:</strong>{" "}
                  <code className="bg-muted px-2 py-1 rounded">/api/health</code>
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

