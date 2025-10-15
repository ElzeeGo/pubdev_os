import * as fs from "fs"
import * as path from "path"
import { pubdevConfig } from "./types"

const CONFIG_FILENAME = "pubdev.config.js"

export function findConfigFile(): string | null {
  let currentDir = process.cwd()
  
  // Search up the directory tree
  while (currentDir !== path.parse(currentDir).root) {
    const configPath = path.join(currentDir, CONFIG_FILENAME)
    if (fs.existsSync(configPath)) {
      return configPath
    }
    currentDir = path.dirname(currentDir)
  }
  
  return null
}

export function loadConfig(): pubdevConfig | null {
  const configPath = findConfigFile()
  
  if (!configPath) {
    return null
  }
  
  try {
    // Clear require cache to get fresh config
    delete require.cache[require.resolve(configPath)]
    const config = require(configPath)
    return config
  } catch (error) {
    console.error(`Error loading config from ${configPath}:`, error)
    return null
  }
}

export function saveConfig(config: pubdevConfig, targetDir: string = process.cwd()): void {
  const configPath = path.join(targetDir, CONFIG_FILENAME)
  
  const configContent = `module.exports = ${JSON.stringify(config, null, 2)}`
  
  fs.writeFileSync(configPath, configContent, "utf-8")
}

export function getDefaultConfig(): Partial<pubdevConfig> {
  return {
    scan: {
      paths: ["src/components", "src/pages", "src/app"],
      ignore: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx", "**/*.spec.tsx"],
    },
    triggers: {
      onBuild: true,
      onCommit: false,
      onPush: false,
    },
  }
}

