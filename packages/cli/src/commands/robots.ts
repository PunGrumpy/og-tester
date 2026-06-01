import { intro, log, note, outro, spinner } from '@clack/prompts'
import { fetchRobotsTxt } from '@og-tester/core'
import { Command } from 'commander'
import color from 'picocolors'

export const robotsCommand = new Command('robots')
  .description("Fetch a site's robots.txt")
  .argument('<url>', 'The URL of the site')
  .option('--json', 'Output raw JSON instead of pretty formatting')
  .action(async (url, options) => {
    let parsedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      parsedUrl = `https://${url}`
    }

    if (!options.json) {
      intro(color.bgCyan(color.black(' OG Tester — Robots.txt ')))
    }

    const s = spinner()
    if (!options.json) {
      s.start(`Fetching robots.txt for ${color.underline(parsedUrl)}...`)
    }

    try {
      const data = await fetchRobotsTxt(parsedUrl)

      if (options.json) {
        console.log(JSON.stringify(data, null, 2))
        return
      }

      s.stop('Successfully fetched robots.txt!')

      if (data.error) {
        log.error(color.red(data.error))
        outro(color.red('Exited with errors.'))
        process.exit(1)
      }

      note(data.content ?? 'Empty robots.txt', 'robots.txt content')
      outro(color.green('Done!'))
    } catch (err: any) {
      if (options.json) {
        console.error(JSON.stringify({ error: err.message }, null, 2))
        process.exit(1)
      }
      s.stop(color.red('Failed to fetch robots.txt'))
      log.error(color.red(err.message))
      outro(color.red('Exited with errors.'))
      process.exit(1)
    }
  })
