import { intro, log, note, outro, spinner } from '@clack/prompts'
import { fetchOgTags } from '@og-tester/core'
import { Command } from 'commander'
import color from 'picocolors'

export const checkCommand = new Command('check')
  .description('Fetch and analyze Open Graph and meta tags for a URL')
  .argument('<url>', 'The URL to check')
  .option('--json', 'Output raw JSON instead of pretty formatting')
  .action(async (url, options) => {
    // Standardize URL to prepend https:// if missing
    let parsedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      parsedUrl = `https://${url}`
    }

    if (!options.json) {
      intro(color.bgCyan(color.black(' OG Tester — Check Tags ')))
    }

    const s = spinner()
    if (!options.json) {
      s.start(`Fetching and parsing ${color.underline(parsedUrl)}...`)
    }

    try {
      const data = await fetchOgTags(parsedUrl)

      if (options.json) {
        console.log(JSON.stringify(data, null, 2))
        return
      }

      s.stop('Successfully fetched and parsed tags!')

      // Format output nicely
      let summaryText = ''

      // General tags
      summaryText += `${color.bold(color.cyan('General Tags:'))}\n`
      const generalFields = [
        'title',
        'description',
        'author',
        'canonical',
        'robots',
        'keywords',
        'themeColor'
      ]
      let hasGeneral = false
      for (const field of generalFields) {
        const val = (data as any)[field]
        if (val) {
          summaryText += `  ${color.dim(field)}: ${val}\n`
          hasGeneral = true
        }
      }
      if (!hasGeneral) summaryText += '  No general tags detected.\n'

      summaryText += '\n'

      // Open Graph tags
      summaryText += `${color.bold(color.magenta('Open Graph Tags (og:*):'))}\n`
      const ogFields = [
        'og:title',
        'og:description',
        'og:image',
        'og:url',
        'og:type',
        'og:site_name',
        'og:locale'
      ]
      let hasOg = false
      for (const field of ogFields) {
        const val = (data as any)[field]
        if (val) {
          summaryText += `  ${color.dim(field)}: ${val}\n`
          hasOg = true
        }
      }
      if (!hasOg) summaryText += '  No Open Graph tags detected.\n'

      summaryText += '\n'

      // Twitter tags
      summaryText += `${color.bold(color.blue('Twitter Card Tags (twitter:*):'))}\n`
      const twitterFields = [
        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image',
        'twitter:site',
        'twitter:creator'
      ]
      let hasTwitter = false
      for (const field of twitterFields) {
        const val = (data as any)[field]
        if (val) {
          summaryText += `  ${color.dim(field)}: ${val}\n`
          hasTwitter = true
        }
      }
      if (!hasTwitter) summaryText += '  No Twitter Card tags detected.\n'

      summaryText += '\n'

      // Icons
      summaryText += `${color.bold(color.yellow('Favicons & Icons:'))}\n`
      if (data.favicons && data.favicons.length > 0) {
        for (const icon of data.favicons) {
          summaryText += `  ${color.dim(icon.rel)}: ${icon.href} ${icon.sizes ? `(${icon.sizes})` : ''}\n`
        }
      } else {
        summaryText += '  No icons detected.\n'
      }

      note(summaryText, 'Report')
      outro(color.green('Done!'))
    } catch (err: any) {
      if (options.json) {
        console.error(JSON.stringify({ error: err.message }, null, 2))
        process.exit(1)
      }
      s.stop(color.red('Failed to fetch or parse tags'))
      log.error(color.red(err.message))
      outro(color.red('Exited with errors.'))
      process.exit(1)
    }
  })
