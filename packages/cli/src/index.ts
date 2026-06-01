import { Command } from 'commander'
import { checkCommand } from './commands/check'
import { robotsCommand } from './commands/robots'
import { sitemapCommand } from './commands/sitemap'

const program = new Command()

program
  .name('og-tester')
  .version('0.1.0')
  .description(
    'Test and analyze Open Graph, Twitter Card, and meta tags from the command line'
  )

program.addCommand(checkCommand)
program.addCommand(robotsCommand)
program.addCommand(sitemapCommand)

program.parse()
