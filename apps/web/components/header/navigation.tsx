import Link from "next/link";

import { STAGGER } from "@/lib/motion";

import { Button } from "../ui/button";
import { ViewAnimation } from "../view-animation";

const NAV = [
  {
    href: "https://www.pungrumpy.com",
    label: "Get in touch",
  },
  {
    href: "https://github.com/PunGrumpy/og-tester",
    label: "GitHub",
  },
];

export const Navigation = () => (
  <div className="flex justify-end gap-x-2">
    {NAV.map(({ href, label }, index) => {
      const isExternal = href.startsWith("http");
      return (
        <ViewAnimation key={label} delay={STAGGER * index}>
          {/* `asChild` renders a single <a>; nesting a <button> inside a link
              is invalid HTML and creates two tab stops per item. */}
          <Button asChild size="sm" variant="outline">
            <Link
              href={href}
              prefetch={isExternal ? false : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              {label}
            </Link>
          </Button>
        </ViewAnimation>
      );
    })}
  </div>
);
