import inquirer from "inquirer"
import * as fs from "fs"
import * as path from "path"
import chalk from "chalk"
import ora from "ora"
import { saveConfig, getDefaultConfig } from "../config"
import { pubdevConfig } from "../types"

export async function initCommand(): Promise<void> {
  console.log(chalk.bold.blue("\n🚀 Welcome to pubdev!\n"))
  console.log("Let's set up automatic content generation for your project.\n")

  // Check if config already exists
  const configPath = path.join(process.cwd(), "pubdev.config.js")
  if (fs.existsSync(configPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "Configuration file already exists. Overwrite?",
        default: false,
      },
    ])

    if (!overwrite) {
      console.log(chalk.yellow("\n✓ Keeping existing configuration"))
      return
    }
  }

  // Prompt for configuration
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "apiUrl",
      message: "Enter your pubdev service URL:",
      default: "https://pubdev.app",
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return "API URL is required"
        }
        try {
          new URL(input)
          return true
        } catch {
          return "Please enter a valid URL"
        }
      },
    },
    {
      type: "input",
      name: "apiKey",
      message: "Enter your pubdev API key:",
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return "API key is required"
        }
        if (!input.startsWith("sk_")) {
          return "API key should start with 'sk_'"
        }
        return true
      },
    },
    {
      type: "input",
      name: "projectId",
      message: "Enter your project ID:",
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return "Project ID is required"
        }
        return true
      },
    },
    {
      type: "input",
      name: "scanPaths",
      message: "Paths to scan (comma-separated):",
      default: "src/components,src/pages,src/app",
    },
    {
      type: "confirm",
      name: "onBuild",
      message: "Run scan automatically on build?",
      default: true,
    },
    {
      type: "confirm",
      name: "setupGitHook",
      message: "Setup git commit hook?",
      default: false,
    },
  ])

  const defaultConfig = getDefaultConfig()

  const config: pubdevConfig = {
    apiUrl: answers.apiUrl,
    apiKey: process.env.pubdev_API_KEY ? "process.env.pubdev_API_KEY" : answers.apiKey,
    projectId: answers.projectId,
    scan: {
      paths: answers.scanPaths.split(",").map((p: string) => p.trim()),
      ignore: defaultConfig.scan?.ignore,
    },
    triggers: {
      onBuild: answers.onBuild,
      onCommit: answers.setupGitHook,
      onPush: false,
    },
  }

  const spinner = ora("Saving configuration...").start()

  try {
    // Save config file
    saveConfig(config, process.cwd())

    // Update package.json if onBuild is enabled
    if (answers.onBuild) {
      await addBuildHook()
    }

    // Setup git hook if requested
    if (answers.setupGitHook) {
      await setupGitHook()
    }

    spinner.succeed(chalk.green("Configuration saved!"))

    console.log(chalk.bold.green("\n✓ Setup complete!\n"))
    console.log(chalk.dim("Configuration saved to:"), "pubdev.config.js")
    
    if (answers.onBuild) {
      console.log(chalk.dim("Build hook added to:"), "package.json")
    }

    console.log(chalk.bold("\nNext steps:"))
    console.log(chalk.dim("1."), "Run", chalk.cyan("npm run build"), "or", chalk.cyan("npx pubdev scan"))
    console.log(chalk.dim("2."), "View generated content at", chalk.cyan("https://pubdev.app"))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red("Failed to save configuration"))
    console.error(error)
    process.exit(1)
  }
}

async function addBuildHook(): Promise<void> {
  const packageJsonPath = path.join(process.cwd(), "package.json")

  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow("\n⚠ package.json not found. Skipping build hook setup."))
    return
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    // Add postbuild script
    packageJson.scripts.postbuild = "pubdev scan"

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf-8")
  } catch (error) {
    console.log(chalk.yellow("\n⚠ Could not update package.json:", error))
  }
}

async function setupGitHook(): Promise<void> {
  const hooksDir = path.join(process.cwd(), ".git", "hooks")

  if (!fs.existsSync(hooksDir)) {
    console.log(chalk.yellow("\n⚠ .git/hooks directory not found. Skipping git hook setup."))
    return
  }

  const postCommitPath = path.join(hooksDir, "post-commit")
  const hookContent = `#!/bin/sh
# pubdev automatic scan
npx pubdev scan --quiet
`

  try {
    fs.writeFileSync(postCommitPath, hookContent, "utf-8")
    fs.chmodSync(postCommitPath, "755") // Make executable
    console.log(chalk.green("\n✓ Git post-commit hook installed"))
  } catch (error) {
    console.log(chalk.yellow("\n⚠ Could not setup git hook:", error))
  }
}

