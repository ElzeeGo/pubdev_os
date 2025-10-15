import chalk from "chalk"
import ora, { Ora } from "ora"
import { loadConfig } from "../config"
import { GitScanner } from "../scanner/git"
import { FeatureDetector } from "../scanner/detector"
import { ProjectAnalyzer } from "../scanner/project-analyzer"
import { pubdevAPIClient } from "../client/api"
import { ScanData } from "../types"

interface ScanOptions {
  quiet?: boolean
  since?: string
  files?: string[]
}

export async function scanCommand(options: ScanOptions = {}): Promise<void> {
  const { quiet = false, since, files } = options

  if (!quiet) {
    console.log(chalk.bold.blue("\n🔍 pubdev Scan\n"))
  }

  // Load configuration
  const config = loadConfig()
  if (!config) {
    console.error(chalk.red("✗ No configuration found. Run 'pubdev init' first."))
    process.exit(1)
  }

  let spinner: Ora | undefined
  if (!quiet) {
    spinner = ora("Initializing scan...").start()
  }

  try {
    // Initialize scanners
    const gitScanner = new GitScanner()
    const featureDetector = new FeatureDetector()
    const projectAnalyzer = new ProjectAnalyzer()

    // Check if this is a git repository
    const isGitRepo = await gitScanner.isGitRepository()
    if (!isGitRepo) {
      throw new Error("Not a git repository. pubdev requires git for change detection.")
    }

    // Get latest commit info
    if (spinner) spinner.text = "Getting commit information..."
    const commit = await gitScanner.getLatestCommit()
    if (!commit) {
      throw new Error("No commits found. Make a commit first.")
    }

    // Get file changes
    if (spinner) spinner.text = "Analyzing changes..."
    let changes
    if (files && files.length > 0) {
      // Specific files provided
      changes = {
        added: files,
        modified: [],
        deleted: [],
      }
    } else if (since) {
      changes = await gitScanner.getChangesSince(since)
    } else {
      // Default: compare with previous commit
      changes = await gitScanner.getChangesSince("HEAD~1")
    }

    const totalChanges = changes.added.length + changes.modified.length + changes.deleted.length
    
    if (totalChanges === 0) {
      spinner?.succeed(chalk.yellow("No changes detected"))
      console.log(chalk.dim("\nTip: Make some code changes or specify a commit range with --since"))
      return
    }

    if (!quiet) {
      console.log(chalk.dim(`  Found ${totalChanges} changed files`))
    }

    // Detect features
    if (spinner) spinner.text = "Detecting features..."
    const features = await featureDetector.detectFeatures(changes, config.scan?.paths)

    if (features.length === 0) {
      spinner?.warn(chalk.yellow("No features detected in changes"))
      console.log(chalk.dim("\nChanges found but no recognizable features."))
      return
    }

    if (!quiet) {
      console.log(chalk.dim(`  Detected ${features.length} features:`))
      features.forEach((f) => {
        console.log(chalk.dim(`    - ${f.name} (${f.type})`))
      })
    }

    // Analyze project context (once per scan)
    if (spinner) spinner.text = "Analyzing project context..."
    const projectContext = await projectAnalyzer.analyzeProject()
    
    if (!quiet) {
      console.log(chalk.dim(`  Project: ${projectContext.name} (${projectContext.framework})`))
      console.log(chalk.dim(`  Type: ${projectContext.type}`))
    }

    // Prepare scan data with project context
    const scanData: ScanData = {
      projectId: config.projectId,
      commit,
      changes,
      features,
      projectContext, // Add full project context
    }

    // Submit to pubdev
    if (spinner) spinner.text = "Submitting to pubdev..."
    const apiClient = new pubdevAPIClient(config.apiKey, config.apiUrl)
    const response = await apiClient.submitScan(scanData)

    spinner?.succeed(chalk.green("Scan complete!"))

    if (!quiet) {
      console.log(chalk.bold.green("\n✓ Successfully scanned and submitted\n"))
      console.log(chalk.dim("Scan ID:"), response.scanId)
      console.log(chalk.dim("Status:"), response.status)
      console.log(chalk.bold("\n→ View generated content:"))
      console.log(chalk.cyan(response.draftUrl))
      console.log()
    }
  } catch (error) {
    spinner?.fail(chalk.red("Scan failed"))
    
    if (error instanceof Error) {
      console.error(chalk.red("\nError:"), error.message)
      
      if (error.message.includes("Failed to submit scan")) {
        console.log(chalk.dim("\nTips:"))
        console.log(chalk.dim("- Check your API key in pubdev.config.js"))
        console.log(chalk.dim("- Verify your project ID is correct"))
        console.log(chalk.dim("- Ensure you have internet connection"))
      }
    } else {
      console.error(error)
    }
    
    process.exit(1)
  }
}

