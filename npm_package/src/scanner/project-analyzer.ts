import * as fs from "fs"
import * as path from "path"

export interface ProjectContext {
  name: string
  description: string
  type: string // "web-app", "library", "api", "mobile-app", etc.
  framework: string // "next.js", "react", "node", etc.
  primaryFeatures: string[]
  tech: string[]
  readme?: string
}

export class ProjectAnalyzer {
  private baseDir: string

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }

  /**
   * Analyzes the entire project to understand what it does
   */
  async analyzeProject(): Promise<ProjectContext> {
    const packageJson = this.readPackageJson()
    const readme = this.readReadme()
    const framework = this.detectFramework()
    const projectType = this.detectProjectType()

    return {
      name: packageJson?.name || path.basename(this.baseDir),
      description: packageJson?.description || this.extractDescriptionFromReadme(readme) || "A software project",
      type: projectType,
      framework,
      primaryFeatures: this.extractFeaturesFromReadme(readme),
      tech: this.extractTechStack(packageJson),
      readme: readme?.substring(0, 1000), // First 1000 chars of README
    }
  }

  private readPackageJson(): any {
    try {
      const packagePath = path.join(this.baseDir, "package.json")
      if (fs.existsSync(packagePath)) {
        return JSON.parse(fs.readFileSync(packagePath, "utf-8"))
      }
    } catch (error) {
      console.error("Error reading package.json:", error)
    }
    return null
  }

  private readReadme(): string | null {
    const readmeFiles = ["README.md", "readme.md", "README", "readme.txt"]
    
    for (const filename of readmeFiles) {
      try {
        const readmePath = path.join(this.baseDir, filename)
        if (fs.existsSync(readmePath)) {
          return fs.readFileSync(readmePath, "utf-8")
        }
      } catch (error) {
        // Continue to next filename
      }
    }
    
    return null
  }

  private detectFramework(): string {
    const packageJson = this.readPackageJson()
    if (!packageJson?.dependencies) return "unknown"

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    if (deps.next) return "Next.js"
    if (deps.react && deps["react-dom"]) return "React"
    if (deps.vue) return "Vue"
    if (deps.angular) return "Angular"
    if (deps.express) return "Express"
    if (deps.fastify) return "Fastify"
    if (deps["@nestjs/core"]) return "NestJS"
    
    return "Node.js"
  }

  private detectProjectType(): string {
    const packageJson = this.readPackageJson()
    if (!packageJson) return "application"

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Check for web app indicators
    if (deps.next || deps.react || deps.vue) {
      return "web-application"
    }

    // Check for API indicators
    if (deps.express || deps.fastify || deps["@nestjs/core"]) {
      return "api-service"
    }

    // Check for library/package
    if (packageJson.main && !packageJson.private) {
      return "library"
    }

    // Check for CLI tool
    if (packageJson.bin) {
      return "cli-tool"
    }

    return "application"
  }

  private extractDescriptionFromReadme(readme: string | null): string | null {
    if (!readme) return null

    // Try to extract first paragraph or heading
    const lines = readme.split("\n")
    
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim()
      
      // Skip title/header
      if (line.startsWith("#")) continue
      
      // First non-empty, non-title line is usually description
      if (line.length > 20 && !line.startsWith("```") && !line.startsWith("-")) {
        return line.substring(0, 200)
      }
    }

    return null
  }

  private extractFeaturesFromReadme(readme: string | null): string[] {
    if (!readme) return []

    const features: string[] = []
    const lines = readme.split("\n")
    
    let inFeaturesSection = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Detect features section
      if (/##?\s+(features|capabilities|what|highlights)/i.test(trimmed)) {
        inFeaturesSection = true
        continue
      }
      
      // Exit features section on next heading
      if (inFeaturesSection && trimmed.startsWith("#")) {
        break
      }
      
      // Extract bullet points
      if (inFeaturesSection && /^[-*]\s+/.test(trimmed)) {
        const feature = trimmed.replace(/^[-*]\s+/, "").replace(/[✓✅🎯🚀]/g, "").trim()
        if (feature.length > 5 && feature.length < 100) {
          features.push(feature)
        }
      }
    }

    return features.slice(0, 10) // Max 10 features
  }

  private extractTechStack(packageJson: any): string[] {
    if (!packageJson?.dependencies) return []

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    const tech: string[] = []

    // Frontend frameworks
    if (deps.react) tech.push("React")
    if (deps.next) tech.push("Next.js")
    if (deps.vue) tech.push("Vue")
    if (deps.svelte) tech.push("Svelte")
    
    // Backend
    if (deps.express) tech.push("Express")
    if (deps["@nestjs/core"]) tech.push("NestJS")
    
    // Databases
    if (deps["@supabase/supabase-js"]) tech.push("Supabase")
    if (deps.prisma) tech.push("Prisma")
    if (deps.mongoose) tech.push("MongoDB")
    
    // Styling
    if (deps.tailwindcss || deps["tailwind-merge"]) tech.push("Tailwind CSS")
    
    // TypeScript
    if (deps.typescript || packageJson.devDependencies?.typescript) tech.push("TypeScript")
    
    // AI/ML
    if (deps.openai || deps["@ai-sdk/openai"]) tech.push("OpenAI")
    if (deps["@google/genai"]) tech.push("Google AI")

    return tech.slice(0, 10)
  }
}

