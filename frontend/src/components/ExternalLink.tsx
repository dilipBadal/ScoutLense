import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith("https://");
  return (
    <a
      className="text-link"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}
