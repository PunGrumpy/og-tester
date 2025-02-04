import { Section } from '@/components/sections/Section'
import { MetadataAttributes } from '@/types/metadata'

import { ContactForm } from './components/ContactForm'
import { MetadataResults } from './components/MetadataResult'

export default function HomePage() {
  const metadata: MetadataAttributes = {
    ogTitle: 'PunGrumpy - Digital Developer & DevOps Engineer',
    ogImage:
      'https://www.pungrumpy.com/api/og?title=Home&subtitle=Website&texture=1',
    ogDescription:
      'Personal portfolio and blog showcasing my work in digital development and DevOps engineering',
    ogUrl: 'https://example.com',
    ogType: 'website',
    ogSiteName: 'Example',
    twitterCard: 'summary',
    twitterTitle: 'Test',
    twitterDescription:
      'Personal portfolio and blog showcasing my work in digital development and DevOps engineering',
    twitterImage:
      'https://www.pungrumpy.com/api/og?title=Home&subtitle=Website&texture=1',
    twitterSite: '@example'
  }

  return (
    <>
      <Section className="border-t">
        <div className="space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
              Open Graph Tester
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter a URL to fetch its Open Graph metadata
            </p>
          </div>

          <ContactForm />
        </div>
      </Section>

      <Section>
        <MetadataResults metadata={metadata} validateMetadata={() => []} />
      </Section>
    </>
  )
}
