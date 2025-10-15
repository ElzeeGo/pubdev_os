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

