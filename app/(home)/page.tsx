import { Section } from '@/components/section'
import { Hero } from './components/hero'
import { InputForm } from './components/input-form'
import { MetaTagsTable } from './components/meta-tags-table'
import { SocialPreview } from './components/social-preview'

const Home = () => (
  <>
    <Hero />
    <InputForm />
    <Section className="grid grid-cols-1 gap-4 divide-x md:grid-cols-2">
      <MetaTagsTable />
      <SocialPreview />
    </Section>
  </>
)

export default Home
