import { Command } from "commander"
import chalk from "chalk"
import { initCommand } from "./cli/init"
import { scanCommand } from "./cli/scan"

const program = new Command()

program
  .name("pubdev")
  .description("Automatic social media content generation for your code releases")
  .version("0.1.0")

program
  .command("init")
  .description("Initialize pubdev in your project")
  .action(async () => {
    try {
      await initCommand()
    } catch (error) {
      console.error(chalk.red("Error:"), error)
      process.exit(1)
    }
  })

program
  .command("scan")
  .description("Scan for changes and submit to pubdev")
  .option("-q, --quiet", "Suppress output")
  .option("-s, --since <commit>", "Compare changes since a specific commit")
  .option("-f, --files <files...>", "Scan specific files")
  .action(async (options) => {
    try {
      await scanCommand(options)
    } catch (error) {
      console.error(chalk.red("Error:"), error)
      process.exit(1)
    }
  })

program.parse(process.argv)

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

