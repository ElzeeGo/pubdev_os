"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { SignInPage, type Testimonial } from "@/components/ui/sign-in"
import { useRouter } from "next/navigation"
import { useState } from "react"

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://i.pravatar.cc/200?img=68",
    name: "Rick S-137",
    handle: "",
    text: "Look, I've automated content across infinite dimensions. This one actually works, which is more than I can *burp* say for 99% of these garbage platforms. Still nihilistic though."
  },
  {
    avatarSrc: "https://i.pravatar.cc/200?img=69",
    name: "Morty M.",
    handle: "",
    text: "Oh geez, I-I-I don't know Rick, are we supposed to say nice things? It saved me time, I guess? Is that good enough? They're not gonna hurt us, right?"
  },
  {
    avatarSrc: "https://i.pravatar.cc/200?img=70",
    name: "Summer S.",
    handle: "",
    text: "Finally, a platform that doesn't make me want to throw my phone into a black hole. It's actually good, which is shocking given how much everything else sucks."
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    // TODO: Implement password reset flow
    router.push("/auth/reset-password")
  }

  const handleCreateAccount = () => {
    router.push("/signup")
  }

  return (
    <SignInPage
      title={<span className="font-light text-foreground tracking-tighter">Welcome to <span className="font-semibold">pubdev</span></span>}
      description="Sign in to automate your content publishing workflow"
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={testimonials}
      onSignIn={handleLogin}
      onGoogleSignIn={handleGoogleLogin}
      onGitHubSignIn={handleGitHubLogin}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
      error={error}
      isLoading={isLoading}
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
    />
  )
}
