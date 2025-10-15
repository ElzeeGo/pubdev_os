"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { SignUpPage, type Testimonial } from "@/components/ui/sign-up"
import { useRouter } from "next/navigation"
import { useState } from "react"

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://i.pravatar.cc/200?img=60",
    name: "Bird Person",
    handle: "",
    text: "In bird culture, this is considered a reasonable use of time. It has been a challenging mating season for developers without automation."
  },
  {
    avatarSrc: "https://i.pravatar.cc/200?img=61",
    name: "Mr. Poopybutthole",
    handle: "",
    text: "Ooh wee! I've been using pubdev for years—or have I? Time is weird. But seriously, it beats manually posting content while questioning your existence!"
  },
  {
    avatarSrc: "https://i.pravatar.cc/200?img=62",
    name: "Jessica W.",
    handle: "",
    text: "I literally only signed up because Brad wouldn't shut up about it. Turns out, it's actually useful? Ugh, I hate when things work as advertised."
  },
]

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name,
          },
        },
      })
      if (signUpError) throw signUpError

      // Check if email confirmation is required
      if (data.user && !data.session) {
        router.push("/auth/check-email")
      } else {
        router.push("/auth/setup-organization")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignup = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/auth/setup-organization`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/auth/setup-organization`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push("/login")
  }

  return (
    <SignUpPage
      title={<span className="font-light text-foreground tracking-tighter">Start with <span className="font-semibold">pubdev</span></span>}
      description="Create your account and automate your content publishing workflow today"
      heroImageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2160&q=80"
      testimonials={testimonials}
      onSignUp={handleSignup}
      onGoogleSignUp={handleGoogleSignup}
      onGitHubSignUp={handleGitHubSignup}
      onSignIn={handleSignIn}
      error={error}
      isLoading={isLoading}
      name={name}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
    />
  )
}
