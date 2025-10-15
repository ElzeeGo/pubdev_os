import simpleGit, { SimpleGit, DiffResult } from "simple-git"
import { CommitInfo, FileChange } from "../types"

export class GitScanner {
  private git: SimpleGit

  constructor(baseDir: string = process.cwd()) {
    this.git = simpleGit(baseDir)
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status()
      return true
    } catch (error) {
      return false
    }
  }

  async getLatestCommit(): Promise<CommitInfo | null> {
    try {
      const log = await this.git.log({ maxCount: 1 })
      
      if (!log.latest) {
        return null
      }

      const commit = log.latest
      
      return {
        sha: commit.hash,
        message: commit.message,
        author: commit.author_name || "Unknown",
        timestamp: commit.date,
      }
    } catch (error) {
      console.error("Error getting latest commit:", error)
      return null
    }
  }

  async getChangesSince(since: string = "HEAD~1"): Promise<FileChange> {
    try {
      const diff: DiffResult = await this.git.diffSummary([since, "HEAD"])
      
      const added: string[] = []
      const modified: string[] = []
      const deleted: string[] = []

      diff.files.forEach((file) => {
        if (file.binary) return // Skip binary files

        // Determine if file was added, modified, or deleted
        if (file.insertions > 0 && file.deletions === 0) {
          added.push(file.file)
        } else if (file.insertions === 0 && file.deletions > 0) {
          deleted.push(file.file)
        } else {
          modified.push(file.file)
        }
      })

      return { added, modified, deleted }
    } catch (error) {
      console.error("Error getting git changes:", error)
      return { added: [], modified: [], deleted: [] }
    }
  }

  async getUncommittedChanges(): Promise<FileChange> {
    try {
      const status = await this.git.status()
      
      return {
        added: status.created,
        modified: status.modified.concat(status.renamed.map(r => r.to || r.from)),
        deleted: status.deleted,
      }
    } catch (error) {
      console.error("Error getting uncommitted changes:", error)
      return { added: [], modified: [], deleted: [] }
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const branch = await this.git.branchLocal()
      return branch.current
    } catch (error) {
      return "main"
    }
  }
}

