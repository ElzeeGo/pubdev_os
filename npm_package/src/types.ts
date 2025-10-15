export interface pubdevConfig {
  apiUrl?: string
  apiKey: string
  projectId: string
  scan?: {
    paths?: string[]
    ignore?: string[]
  }
  triggers?: {
    onBuild?: boolean
    onCommit?: boolean
    onPush?: boolean
  }
}

export interface CommitInfo {
  sha: string
  message: string
  author: string
  timestamp: string
}

export interface FileChange {
  added: string[]
  modified: string[]
  deleted: string[]
}

export interface Feature {
  type: "component" | "page" | "api" | "feature"
  name: string
  description: string
  filePath: string
  code?: string
}

export interface ProjectContext {
  name: string
  description: string
  type: string
  framework: string
  primaryFeatures: string[]
  tech: string[]
  readme?: string
}

export interface ScanData {
  projectId: string
  commit: CommitInfo
  changes: FileChange
  features: Feature[]
  projectContext?: ProjectContext
}

export interface ScanResponse {
  scanId: string
  status: "processing" | "completed"
  draftUrl: string
}

