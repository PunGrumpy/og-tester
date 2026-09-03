import { cacheLife } from "next/cache";
import Link from "next/link";

import { Container } from "@/components/layout";
import { NewTabHint } from "@/components/new-tab-hint";

import { ThemeSwitcher } from "./theme-switcher";

const LINKS = [
  { href: "https://github.com/PunGrumpy/og-tester", label: "GitHub" },
  { href: "https://www.npmjs.com/package/og-tester", label: "npm" },
  { href: "https://www.pungrumpy.com", label: "Contact" },
] as const;

const INLINE_LINK_CLASS =
  "text-inherit underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

const LINK_CLASS =
  "inline-flex min-h-6 w-fit items-center text-inherit underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

// oxlint-disable-next-line require-await
const currentYear = async () => {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
};

export const Footer = async () => (
  <footer className="text-muted-foreground mt-auto border-t py-8 text-sm">
    <Container>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-7 lg:flex lg:items-center lg:gap-6">
        <p className="col-start-1 row-start-2 m-0 flex min-w-0 flex-wrap gap-x-1.5 leading-6 lg:order-1 lg:me-auto">
          <span className="whitespace-nowrap">
            © {await currentYear()}{" "}
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
              <NewTabHint />
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
