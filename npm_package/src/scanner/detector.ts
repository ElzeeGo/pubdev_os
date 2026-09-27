import * as fs from "fs"
import * as path from "path"
import { Feature, FileChange } from "../types"
import { CodeParser } from "./parser"

export class FeatureDetector {
  private parser: CodeParser
  private baseDir: string

  constructor(baseDir: string = process.cwd()) {
    this.parser = new CodeParser()
    this.baseDir = baseDir
  }

  listAllFiles(scanPaths?: string[], ignore: string[] = []): string[] {
    const roots = scanPaths && scanPaths.length > 0 ? scanPaths : ["."]
    const files: string[] = []
    const skipDirs = new Set(["node_modules", ".next", "dist", ".git", "coverage"])

    for (const root of roots) {
      const absoluteRoot = path.isAbsolute(root) ? root : path.join(this.baseDir, root)
      this.walk(absoluteRoot, skipDirs, ignore, files)
    }

    return files
  }

  async detectFeatures(changes: FileChange, scanPaths?: string[]): Promise<Feature[]> {
    const features: Feature[] = []
    const allChangedFiles = [...changes.added, ...changes.modified]

    for (const file of allChangedFiles) {
      const fullPath = path.isAbsolute(file) ? file : path.join(this.baseDir, file)

      // Check if file should be scanned
      if (!this.shouldScanFile(fullPath, scanPaths)) {
        continue
      }

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        continue
      }

      const feature = this.parser.parseFile(fullPath)
      if (feature) {
        features.push(feature)
      }
    }

    return features
  }

  private walk(
    directory: string,
    skipDirs: Set<string>,
    ignore: string[],
    files: string[]
  ): void {
    if (!fs.existsSync(directory)) return

    const entries = fs.readdirSync(directory, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue
        this.walk(path.join(directory, entry.name), skipDirs, ignore, files)
        continue
      }

      const absolutePath = path.join(directory, entry.name)
      if (!this.shouldScanFile(absolutePath)) continue

      const relativePath = path.relative(this.baseDir, absolutePath)
      if (this.isIgnored(relativePath, ignore)) continue
      files.push(relativePath)
    }
  }

  private isIgnored(relativePath: string, ignore: string[]): boolean {
    const normalized = relativePath.split(path.sep).join("/")
    return ignore.some((pattern) => globToRegExp(pattern).test(normalized))
  }

  private shouldScanFile(filePath: string, scanPaths?: string[]): boolean {
    const ext = path.extname(filePath)
    
    // Only scan TypeScript/JavaScript files
    if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
      return false
    }

    // If no scan paths specified, scan all
    if (!scanPaths || scanPaths.length === 0) {
      return true
    }

    // Check if file is in any of the scan paths
    return scanPaths.some((scanPath) => {
      const fullScanPath = path.isAbsolute(scanPath)
        ? scanPath
        : path.join(this.baseDir, scanPath)
      
      return filePath.startsWith(fullScanPath)
    })
  }
}

function globToRegExp(pattern: string): RegExp {
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\{\{GLOBSTAR\}\}\/?/g, "(?:.*/)?")

  return new RegExp(`^${source}$`)
}

