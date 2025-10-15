"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Building2, 
  FolderGit2, 
  Settings, 
  Twitter, 
  Linkedin, 
  Facebook,
  Instagram,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Users,
  Lightbulb,
  Briefcase
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface StepProps {
  userData: any
  onNext: (data?: any) => void
  onSkip?: () => void
  isLoading?: boolean
}

// Welcome Step
export function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="text-center space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
          Welcome to <span className="text-primary">pubdev</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Let's get you set up in just a few minutes. We'll help you create your first project 
          and start automating your content workflow.
        </p>
      </div>

      <div className="pt-8">
        <Button size="lg" onClick={() => onNext()} className="rounded-full px-8 text-lg h-14 shadow-lg">
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          Takes less than 3 minutes • No credit card required
        </p>
      </div>
    </div>
  )
}

// About You Step
export function AboutYouStep({ userData, onNext }: StepProps) {
  const [role, setRole] = useState(userData.role || "")
  const [companyName, setCompanyName] = useState(userData.companyName || "")

  const roleOptions = [
    { id: "developer", label: "Developer" },
    { id: "founder", label: "Founder / CEO" },
    { id: "product-manager", label: "Product Manager" },
    { id: "marketing", label: "Marketing" },
    { id: "designer", label: "Designer" },
    { id: "other", label: "Other" },
  ]

  const handleContinue = () => {
    onNext({ role, companyName })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Tell us about yourself</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Help us personalize your experience
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-3">
          <Label className="text-base">What's your role?</Label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setRole(option.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${role === option.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
                {role === option.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary float-right" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="company-name" className="text-base">
            Company name <span className="text-muted-foreground text-sm">(optional)</span>
          </Label>
          <Input
            id="company-name"
            type="text"
            placeholder="Acme Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-14 text-lg rounded-2xl"
          />
        </div>

        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full rounded-full text-lg h-14 shadow-lg"
          disabled={!role}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Team Step
export function TeamStep({ userData, onNext }: StepProps) {
  const [teamSize, setTeamSize] = useState(userData.teamSize || "")
  const [howFoundUs, setHowFoundUs] = useState(userData.howFoundUs || "")
  const [primaryUseCase, setPrimaryUseCase] = useState(userData.primaryUseCase || "")

  const teamSizeOptions = [
    { id: "solo", label: "Just me", icon: "👤" },
    { id: "2-5", label: "2-5 people", icon: "👥" },
    { id: "6-20", label: "6-20 people", icon: "👨‍👩‍👧‍👦" },
    { id: "21-50", label: "21-50 people", icon: "🏢" },
    { id: "51-200", label: "51-200 people", icon: "🏛️" },
    { id: "200+", label: "200+ people", icon: "🌆" },
  ]

  const howFoundOptions = [
    { id: "twitter", label: "X (Twitter)" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "search", label: "Search Engine" },
    { id: "friend", label: "Friend / Colleague" },
    { id: "blog", label: "Blog / Article" },
    { id: "github", label: "GitHub" },
    { id: "other", label: "Other" },
  ]

  const handleContinue = () => {
    onNext({ teamSize, howFoundUs, primaryUseCase })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">About your team</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          This helps us understand how to better serve you
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <Label className="text-base">How big is your team?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {teamSizeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTeamSize(option.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${teamSize === option.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }
                `}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <span className="text-sm font-medium">{option.label}</span>
                {teamSize === option.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base">How did you hear about us?</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {howFoundOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setHowFoundUs(option.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${howFoundUs === option.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }
                `}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {howFoundUs === option.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="use-case" className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            What's your main goal with pubdev?
          </Label>
          <Textarea
            id="use-case"
            placeholder="e.g., Automate social media for product launches, save time on content creation..."
            value={primaryUseCase}
            onChange={(e) => setPrimaryUseCase(e.target.value)}
            className="min-h-24 text-base rounded-2xl"
          />
        </div>

        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full rounded-full text-lg h-14 shadow-lg"
          disabled={!teamSize || !howFoundUs}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Organization Step
export function OrganizationStep({ userData, onNext, isLoading }: StepProps) {
  const [orgName, setOrgName] = useState(userData.organizationName || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    if (!orgName.trim()) {
      setError("Organization name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check if user already has an organization via memberships
      const { data: existingMemberships } = await supabase
        .from("memberships")
        .select("organization_id, organizations(id, name)")
        .eq("role", "owner")
        .limit(1)

      if (existingMemberships && existingMemberships.length > 0) {
        const org = existingMemberships[0].organizations as any
        // Use existing organization
        onNext({
          organizationName: org.name,
          organizationId: org.id,
        })
        return
      }

      // Create new organization via API
      const slug = orgName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: orgName.trim(),
          slug: slug
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create organization")
      }

      const { organization } = await response.json()

      onNext({
        organizationName: organization.name,
        organizationId: organization.id,
      })
    } catch (err: any) {
      setError(err.message || "Failed to create organization")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Create Your Organization</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Organizations help you manage projects, team members, and billing in one place.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-3">
          <Label htmlFor="org-name" className="text-base">Organization Name</Label>
          <Input
            id="org-name"
            type="text"
            placeholder="My Company"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="h-14 text-lg rounded-2xl"
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <p className="text-sm text-muted-foreground">
            You can change this later in your settings.
          </p>
        </div>

        <Button 
          size="lg" 
          onClick={handleCreate} 
          className="w-full rounded-full text-lg h-14 shadow-lg"
          disabled={loading || !orgName.trim()}
        >
          {loading ? "Creating..." : "Continue"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Project Step
export function ProjectStep({ userData, onNext }: StepProps) {
  const [projectName, setProjectName] = useState(userData.projectName || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError("Project name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const slug = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: projectName.trim(),
            slug: slug,
            organization_id: userData.organizationId,
          },
        ])
        .select()
        .single()

      if (projectError) throw projectError

      onNext({
        projectName: project.name,
        projectId: project.id,
      })
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <FolderGit2 className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Create Your First Project</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Projects help you organize your content and track your publishing across different codebases.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-3">
          <Label htmlFor="project-name" className="text-base">Project Name</Label>
          <Input
            id="project-name"
            type="text"
            placeholder="My Awesome App"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-14 text-lg rounded-2xl"
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            Choose a name for your first project. You can add more projects later.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button 
          size="lg" 
          onClick={handleCreate} 
          className="w-full rounded-full text-lg h-14 shadow-lg"
          disabled={loading || !projectName.trim()}
        >
          {loading ? "Creating..." : "Continue"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Preferences Step
export function PreferencesStep({ userData, onNext, onSkip }: StepProps) {
  const [platforms, setPlatforms] = useState<string[]>(userData.preferences?.platforms || [])

  const platformOptions = [
    { id: "twitter", name: "X (Twitter)", icon: Twitter },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin },
    { id: "facebook", name: "Facebook", icon: Facebook },
    { id: "instagram", name: "Instagram", icon: Instagram },
  ]

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleContinue = () => {
    onNext({
      preferences: {
        ...userData.preferences,
        platforms,
      },
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Choose Your Platforms</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Select which platforms you'd like to publish to. You can change this later.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformOptions.map((platform) => {
            const Icon = platform.icon
            const isSelected = platforms.includes(platform.id)
            
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold">{platform.name}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-primary" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-8 space-y-3">
          <Button 
            size="lg" 
            onClick={handleContinue} 
            className="w-full rounded-full text-lg h-14 shadow-lg"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={onSkip} 
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}

// Connect Step
export function ConnectStep({ onNext, onSkip }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Twitter className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Connect Your Accounts</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Connect your social media accounts to enable one-click publishing. You can do this later from your dashboard.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-secondary/30 text-center">
          <Twitter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You'll be able to connect X (Twitter), LinkedIn, Facebook, and other platforms from your dashboard settings.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            size="lg" 
            onClick={onNext} 
            className="w-full rounded-full text-lg h-14 shadow-lg"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={onSkip} 
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}

// Complete Step
export function CompleteStep({ onNext, isLoading }: StepProps) {
  return (
    <div className="text-center space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
          You're All Set! 🎉
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your account is ready. Start by installing the NPM package or uploading your first code scan.
        </p>
      </div>

      <div className="max-w-lg mx-auto bg-secondary/50 border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Quick Start Guide:</h3>
        <ol className="text-left space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</Badge>
            <span>Install the NPM package: <code className="bg-muted px-2 py-1 rounded">npm install -D pubdev</code></span>
          </li>
          <li className="flex gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</Badge>
            <span>Generate your API key from project settings</span>
          </li>
          <li className="flex gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</Badge>
            <span>Run <code className="bg-muted px-2 py-1 rounded">npx pubdev scan</code> in your project</span>
          </li>
          <li className="flex gap-3">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</Badge>
            <span>Review and publish your generated content!</span>
          </li>
        </ol>
      </div>

      <div className="pt-4">
        <Button 
          size="lg" 
          onClick={() => onNext()} 
          className="rounded-full px-8 text-lg h-14 shadow-lg"
          disabled={isLoading}
        >
          <Rocket className="w-5 h-5 mr-2" />
          {isLoading ? "Finishing..." : "Go to Dashboard"}
        </Button>
      </div>
    </div>
  )
}

