"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { GooeyLoader } from "@/components/ui/loader-10"

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true)
    
    // Keep loader visible for a minimum duration for better UX
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Show for at least 800ms

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-200">
      <GooeyLoader />
    </div>
  )
}

