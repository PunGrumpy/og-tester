import Link from "next/link";

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
        <ViewAnimation
          key={label}
          delay={0.4 * index}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Link
            href={href}
            prefetch={Boolean(isExternal)}
            rel={isExternal ? "noopener noreferrer" : undefined}
            target={isExternal ? "_blank" : undefined}
            passHref
          >
            <Button size="sm" variant="outline">
              {label}
            </Button>
          </Link>
        </ViewAnimation>
      );
    })}
  </div>
);
