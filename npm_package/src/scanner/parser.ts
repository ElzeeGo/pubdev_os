import * as fs from "fs"
import * as path from "path"
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import { Feature } from "../types"

// Helper function to detect React components
function looksLikeReactComponent(code: string, name: string): boolean {
  // Check if function returns JSX
  const hasJSXReturn = /return\s*\(?\s*</.test(code)
  const hasReactImport = /import.*from\s+['"]react['"]/.test(code)
  const startsWithCapital = /^[A-Z]/.test(name)

  return (hasJSXReturn || hasReactImport) && startsWithCapital
}

export class CodeParser {
  parseFile(filePath: string): Feature | null {
    try {
      const code = fs.readFileSync(filePath, "utf-8")
      const ext = path.extname(filePath)

      // Only parse TypeScript/JavaScript files
      if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
        return null
      }

      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      })

      let componentName: string | null = null
      let isReactComponent = false
      let description = ""

      traverse(ast, {
        // Detect React components (function components)
        FunctionDeclaration(path) {
          const name = path.node.id?.name
          if (name && looksLikeReactComponent(code, name)) {
            componentName = name
            isReactComponent = true
          }
        },
        // Arrow function components
        VariableDeclarator(path) {
          const name = path.node.id.type === "Identifier" ? path.node.id.name : null
          if (name && looksLikeReactComponent(code, name)) {
            componentName = name
            isReactComponent = true
          }
        },
        // Class components
        ClassDeclaration(path) {
          const name = path.node.id?.name
          const superClass = path.node.superClass
          
          if (
            name &&
            superClass &&
            superClass.type === "MemberExpression" &&
            superClass.object.type === "Identifier" &&
            superClass.object.name === "React"
          ) {
            componentName = name
            isReactComponent = true
          }
        },
      })

      if (!componentName) {
        // Try to extract from filename
        const filename = path.basename(filePath, ext)
        componentName = filename.charAt(0).toUpperCase() + filename.slice(1)
      }

      // Extract JSDoc or first comment as description
      const commentMatch = code.match(/\/\*\*\s*(.*?)\s*\*\//s)
      if (commentMatch) {
        description = commentMatch[1].replace(/\s*\*\s*/g, " ").trim()
      }

      const feature: Feature = {
        type: this.inferFeatureType(filePath, isReactComponent),
        name: componentName,
        description: description || `${componentName} in ${path.basename(filePath)}`,
        filePath: filePath,
        code: code.substring(0, 500), // First 500 chars as preview
      }

      return feature
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error)
      return null
    }
  }


  private inferFeatureType(
    filePath: string,
    isReactComponent: boolean
  ): Feature["type"] {
    const normalizedPath = filePath.toLowerCase()

    if (normalizedPath.includes("/pages/") || normalizedPath.includes("/app/")) {
      return "page"
    }
    if (normalizedPath.includes("/api/")) {
      return "api"
    }
    if (isReactComponent || normalizedPath.includes("/components/")) {
      return "component"
    }
    return "feature"
  }
}

