import { Section, SectionSeparator } from '@/components/section'
import { Hero } from './components/hero'
import { InputForm } from './components/input-form'
import { MetaTagsTable } from './components/meta-tags-table'
import { ScreenshotPreview } from './components/screenshot-preview'
import { SocialPreview } from './components/social-preview'

const Home = () => (
  <>
    <Hero />
    <SectionSeparator />
    <InputForm />
    <Section className="grid min-h-[420px] gap-0 lg:grid-cols-[1fr_420px] lg:divide-x">
      <MetaTagsTable />
      <SocialPreview />
    </Section>
    <SectionSeparator />
    <Section>
      <ScreenshotPreview />
    </Section>
    <SectionSeparator />
  </>
)

export default Home
