// Programmatic API for pubdev
export { pubdevAPIClient } from "./client/api"
export { GitScanner } from "./scanner/git"
export { CodeParser } from "./scanner/parser"
export { FeatureDetector } from "./scanner/detector"
export { ProjectAnalyzer } from "./scanner/project-analyzer"
export { loadConfig, saveConfig, getDefaultConfig } from "./config"
export * from "./types"

// Main scan function for programmatic use
import { loadConfig } from "./config"
import { GitScanner } from "./scanner/git"
import { FeatureDetector } from "./scanner/detector"
import { ProjectAnalyzer } from "./scanner/project-analyzer"
import { pubdevAPIClient } from "./client/api"
import { ScanData, ScanResponse } from "./types"

export async function scan(): Promise<ScanResponse> {
  const config = loadConfig()
  
  if (!config) {
    throw new Error("No pubdev configuration found. Run 'pubdev init' first.")
  }

  const gitScanner = new GitScanner()
  const featureDetector = new FeatureDetector()
  const projectAnalyzer = new ProjectAnalyzer()

  // Get commit info
  const commit = await gitScanner.getLatestCommit()
  if (!commit) {
    throw new Error("No commits found")
  }

  // Get changes
  const changes = await gitScanner.getChangesSince("HEAD~1")

  // Detect features
  const features = await featureDetector.detectFeatures(changes, config.scan?.paths)

  // Analyze project context
  const projectContext = await projectAnalyzer.analyzeProject()

  // Prepare and submit with project context
  const scanData: ScanData = {
    projectId: config.projectId,
    commit,
    changes,
    features,
    projectContext,
  }

  const apiClient = new pubdevAPIClient(config.apiKey, config.apiUrl)
  return apiClient.submitScan(scanData)
}

