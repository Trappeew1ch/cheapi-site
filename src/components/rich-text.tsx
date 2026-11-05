import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;

function renderInline(text: string): ReactNode[] {
  const parts = text.split(TOKEN).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/") || href.startsWith("#")) {
        return (
          <Link key={`${href}-${index}`} href={href}>
            {label}
          </Link>
        );
      }
      return (
        <a
          key={`${href}-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      );
    }

    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;

    const code = part.match(/^`([^`]+)`$/);
    if (code) return <code key={index}>{code[1]}</code>;

    return <span key={index}>{part}</span>;
  });
}

/** Minimal inline formatting for article copy: [links](/path), **bold**, `code`. */
export function RichText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
