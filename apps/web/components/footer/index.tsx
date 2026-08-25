import Link from "next/link";

import { Container } from "@/components/layout";

import { ThemeSwitcher } from "./theme-switcher";

const LINKS = [
  { href: "https://github.com/PunGrumpy/og-tester", label: "GitHub" },
  { href: "https://www.npmjs.com/package/og-tester", label: "npm" },
  { href: "https://www.pungrumpy.com", label: "Contact" },
] as const;

// `inline-flex` + a 24px min height so every footer target clears WCAG
// 2.5.8's floor; the links render at 14–16px and would otherwise be 20px tall.
// Inside running text, so it takes 2.5.8's inline exception and stays a
// plain inline link rather than growing a 24px box mid-sentence.
const INLINE_LINK_CLASS =
  "text-inherit underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

const LINK_CLASS =
  "inline-flex min-h-6 w-fit items-center text-inherit underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export const Footer = () => (
  <footer className="mt-auto border-t py-8 text-muted-foreground text-sm">
    <Container>
      {/* Below lg the nav takes the first row on its own and the byline and
          theme control share the second; from lg the three sit on one line.
          `items-end` so the two short items align on the nav's baseline
          rather than floating in the taller row. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-7 lg:flex lg:items-center lg:gap-6">
        <p className="col-start-1 row-start-2 m-0 flex min-w-0 flex-wrap gap-x-1.5 leading-6 lg:order-1 lg:mr-auto">
          {/* nowrap so a narrow viewport breaks between clauses rather than
              mid-name. */}
          <span className="whitespace-nowrap">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            <Link className={INLINE_LINK_CLASS} href="https://pungrumpy.com">
              Noppakorn Kaewsalabnil
            </Link>
            .
          </span>
        </p>

        <nav
          aria-label="Footer"
          className="col-span-2 row-start-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-base lg:order-2 lg:gap-5 lg:text-sm"
        >
          {LINKS.map(({ href, label }) => (
            <Link
              className={LINK_CLASS}
              href={href}
              key={label}
              prefetch={false}
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="col-start-2 row-start-2 lg:order-3">
          <ThemeSwitcher />
        </div>
      </div>
    </Container>
  </footer>
);
