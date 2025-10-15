"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  WelcomeStep,
  AboutYouStep,
  TeamStep,
  OrganizationStep, 
  ProjectStep, 
  PreferencesStep, 
  ConnectStep, 
  CompleteStep 
} from "@/components/onboarding/steps"
import { OnboardingProgress } from "@/components/onboarding/progress"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({
    organizationName: "",
    organizationId: "",
    projectName: "",
    projectId: "",
    projectDescription: "",
    preferences: {
      notifications: true,
      autoPublish: false,
      platforms: [] as string[],
    },
    teamSize: "",
    howFoundUs: "",
    role: "",
    companyName: "",
    primaryUseCase: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { id: "welcome", title: "Welcome", component: WelcomeStep },
    { id: "about", title: "About You", component: AboutYouStep },
    { id: "team", title: "Your Team", component: TeamStep },
    { id: "organization", title: "Organization", component: OrganizationStep },
    { id: "project", title: "Project", component: ProjectStep },
    { id: "preferences", title: "Preferences", component: PreferencesStep },
    { id: "connect", title: "Connect", component: ConnectStep },
    { id: "complete", title: "Complete", component: CompleteStep },
  ]

  const CurrentStepComponent = steps[currentStep].component

  const handleNext = async (data?: Partial<typeof userData>) => {
    if (data) {
      setUserData({ ...userData, ...data })
    }

    if (currentStep === steps.length - 1) {
      await completeOnboarding()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamSize: userData.teamSize,
          howFoundUs: userData.howFoundUs,
          role: userData.role,
          companyName: userData.companyName,
          primaryUseCase: userData.primaryUseCase,
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push("/dashboard")
      }
    }

    checkOnboarding()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">pubdev</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />

          {/* Main Content Card */}
          <div className="mt-8 bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <CurrentStepComponent
              userData={userData}
              onNext={handleNext}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          </div>

          {/* Navigation */}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

