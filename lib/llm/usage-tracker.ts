import { createClient } from "@/lib/supabase/server"

export interface GenerationMetrics {
  durationMs: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  imagesGenerated: number
  videosGenerated: number
  videoSeconds: number
  videoSize?: string
  model: string
  type: "text" | "image" | "video" | "both"
}

export interface GenerationLogInput {
  userId: string
  organizationId: string
  projectId: string
  draftId?: string
  scanId?: string
  metrics: GenerationMetrics
  status?: "completed" | "failed" | "cached"
  error?: string
  metadata?: Record<string, any>
}

/**
 * Logs an AI generation request for billing and analytics
 */
export async function logGeneration(input: GenerationLogInput): Promise<string | null> {
  try {
    // Use service client to bypass RLS since this is called from API routes
    const { createServiceClient } = await import("@/lib/supabase/server")
    const supabase = createServiceClient()

    // Calculate cost based on model and usage
    const cost = await calculateCost(input.metrics, supabase)

    // Insert generation log
    const { data, error} = await supabase
      .from("generation_logs")
      .insert({
        user_id: input.userId,
        organization_id: input.organizationId,
        project_id: input.projectId,
        draft_id: input.draftId,
        scan_id: input.scanId,
        type: input.metrics.type,
        model: input.metrics.model,
        duration_ms: input.metrics.durationMs,
        prompt_tokens: input.metrics.promptTokens,
        completion_tokens: input.metrics.completionTokens,
        total_tokens: input.metrics.totalTokens,
        images_generated: input.metrics.imagesGenerated,
        videos_generated: input.metrics.videosGenerated || 0,
        video_seconds: input.metrics.videoSeconds || 0,
        cost_usd: cost,
        status: input.status || "completed",
        error: input.error,
        metadata: input.metadata || {},
      })
      .select("id")
      .single()

    if (error) {
      console.error("[catchy] Error logging generation:", error)
      return null
    }

    return data.id
  } catch (error) {
    console.error("[catchy] Error in logGeneration:", error)
    return null
  }
}

/**
 * Calculate cost for a generation based on model and usage
 */
async function calculateCost(metrics: GenerationMetrics, supabase: any): Promise<number> {
  let totalCost = 0

  // Calculate text generation cost
  if (metrics.type === "text" || metrics.type === "both") {
    const { data } = await supabase.rpc("calculate_text_generation_cost", {
      p_model: metrics.model,
      p_prompt_tokens: metrics.promptTokens,
      p_completion_tokens: metrics.completionTokens,
    })
    totalCost += data || 0
  }

  // Calculate image generation cost
  if (metrics.type === "image" || (metrics.type === "both" && metrics.imagesGenerated > 0)) {
    const { data: imageCost } = await supabase.rpc("calculate_image_generation_cost", {
      p_model: metrics.type === "image" ? metrics.model : "gemini-2.5-flash-image",
      p_images_count: metrics.imagesGenerated,
    })
    totalCost += imageCost || 0
  }

  // Calculate video generation cost (with size awareness for sora-2-pro)
  if (metrics.type === "video" || (metrics.type === "both" && metrics.videosGenerated > 0)) {
    // Use size-aware function if video size is provided
    if (metrics.videoSize) {
      const { data: videoCost } = await supabase.rpc("calculate_video_generation_cost_with_size", {
        p_model: metrics.model,
        p_video_count: metrics.videosGenerated,
        p_video_seconds: metrics.videoSeconds,
        p_video_size: metrics.videoSize,
      })
      totalCost += videoCost || 0
    } else {
      // Fallback to base function (without size consideration)
      const { data: videoCost } = await supabase.rpc("calculate_video_generation_cost", {
        p_model: metrics.model,
        p_video_count: metrics.videosGenerated,
        p_video_seconds: metrics.videoSeconds,
      })
      totalCost += videoCost || 0
    }
  }

  return totalCost
}

/**
 * Check if organization has available credits
 */
export async function checkQuotaAvailable(
  organizationId: string,
  estimatedCost: number = 0.01
): Promise<boolean> {
  try {
    // Use service client to bypass RLS since this is called from API routes
    const { createServiceClient } = await import("@/lib/supabase/server")
    const supabase = createServiceClient()

    const { data, error } = await supabase.rpc("check_credits_available", {
      p_organization_id: organizationId,
      p_estimated_cost: estimatedCost,
    })

    if (error) {
      console.error("[catchy] Error checking credits:", error)
      return false // Deny on error
    }

    return data === true
  } catch (error) {
    console.error("[catchy] Error in checkQuotaAvailable:", error)
    return false
  }
}

/**
 * Get current credit balance and usage for organization
 */
export async function getCreditBalance(organizationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_balances")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (error) {
    console.error("[catchy] Error fetching credit balance:", error)
    return null
  }

  return data
}

/**
 * Get generation history for organization
 */
export async function getGenerationHistory(
  organizationId: string,
  limit: number = 50
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("generation_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[catchy] Error fetching generation history:", error)
    return []
  }

  return data
}

/**
 * Add credits to organization (after payment)
 */
export async function addCredits(
  organizationId: string,
  amountUsd: number,
  purchaseId: string
) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("add_credits", {
    p_organization_id: organizationId,
    p_amount_usd: amountUsd,
    p_purchase_id: purchaseId,
  })

  if (error) {
    console.error("[catchy] Error adding credits:", error)
    return false
  }

  return true
}

/**
 * Create credit purchase record
 */
export async function createCreditPurchase(
  organizationId: string,
  amountUsd: number,
  paymentMethod: string,
  paymentId: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_purchases")
    .insert({
      organization_id: organizationId,
      amount_usd: amountUsd,
      payment_method: paymentMethod,
      payment_id: paymentId,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[catchy] Error creating purchase:", error)
    return null
  }

  return data
}

/**
 * Get purchase history
 */
export async function getPurchaseHistory(
  organizationId: string,
  limit: number = 50
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_purchases")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[catchy] Error fetching purchase history:", error)
    return []
  }

  return data
}

