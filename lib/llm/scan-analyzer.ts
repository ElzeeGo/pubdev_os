import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface ScanFeature {
  type: "component" | "page" | "api" | "feature"
  name: string
  description: string
  filePath: string
  code?: string
}

interface EnhancedFeature {
  name: string
  type: string
  description: string
  userBenefit: string
  businessImpact: "low" | "medium" | "high"
  marketingAngle: string
  keyFeatures: string[]
}

interface ScanAnalysis {
  overallFeature: string
  impact: "low" | "medium" | "high"
  releaseNote: string
  enhancedFeatures: EnhancedFeature[]
  suggestedHashtags: string[]
}

/**
 * Analyzes scan data with AI to generate rich descriptions for content generation
 */
export async function analyzeScanWithAI(
  features: ScanFeature[],
  commitMessage: string,
  author: string,
  projectContext?: {
    name: string
    description: string
    type: string
    framework: string
    primaryFeatures: string[]
    tech: string[]
  }
): Promise<ScanAnalysis> {
  const prompt = `You are a technical analyst reviewing code changes for social media announcement.

${projectContext ? `
PROJECT CONTEXT:
- Name: ${projectContext.name}
- Description: ${projectContext.description}
- Type: ${projectContext.type}
- Framework: ${projectContext.framework}
- Tech Stack: ${projectContext.tech.join(", ")}
- Key Features: ${projectContext.primaryFeatures.slice(0, 5).join(", ")}
` : ''}

COMMIT MESSAGE: ${commitMessage}
AUTHOR: ${author}

CHANGED FILES AND CODE:
${features.map((f, i) => `
${i + 1}. ${f.filePath}
   Type: ${f.type}
   Name: ${f.name}
   Code Preview:
\`\`\`typescript
${f.code || 'No code preview'}
\`\`\`
`).join('\n')}

Analyze these changes and return JSON with:

{
  "overallFeature": "What is the main feature or improvement? (one sentence)",
  "impact": "low|medium|high",
  "releaseNote": "One compelling sentence for users (50-100 chars)",
  "enhancedFeatures": [
    {
      "name": "Feature name",
      "type": "component|page|api|infrastructure",
      "description": "What this does (user-friendly, not technical jargon)",
      "userBenefit": "How this helps users",
      "businessImpact": "low|medium|high",
      "marketingAngle": "Why users should care (one sentence)",
      "keyFeatures": ["Notable", "capability", "list"]
    }
  ],
  "suggestedHashtags": ["relevant", "hashtags", "max 3-5"]
}

Focus on:
1. User-facing benefits, not technical details
2. Business value and improvements
3. Exciting, marketing-friendly language
4. Concrete features users will notice

Return ONLY valid JSON, no other text.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.5,
    })

    // Strip markdown code blocks
    let cleaned = text.trim()
    if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7)
    else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3)
    if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length - 3)
    
    const analysis = JSON.parse(cleaned.trim())
    return analysis
  } catch (error) {
    console.error("[pubdev] Error analyzing scan with AI:", error)
    
    // Fallback to basic analysis
    return {
      overallFeature: commitMessage || "Code updates",
      impact: "medium",
      releaseNote: `${features.length} improvements to ${features[0]?.name || 'codebase'}`,
      enhancedFeatures: features.map(f => ({
        name: f.name,
        type: f.type,
        description: f.description,
        userBenefit: `Improved ${f.type} functionality`,
        businessImpact: "medium" as const,
        marketingAngle: `Enhanced ${f.name} for better user experience`,
        keyFeatures: [f.description],
      })),
      suggestedHashtags: ["tech", "development", "update"],
    }
  }
}

/**
 * Formats AI analysis into content generation context
 */
export function formatScanAnalysisForContent(analysis: ScanAnalysis): {
  title: string
  description: string
  changes: string[]
  hashtags: string[]
} {
  return {
    title: analysis.overallFeature,
    description: analysis.releaseNote,
    changes: analysis.enhancedFeatures.map(f => 
      `${f.name}: ${f.marketingAngle}`
    ),
    hashtags: analysis.suggestedHashtags,
  }
}

