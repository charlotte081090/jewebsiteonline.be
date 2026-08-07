import Link from "next/link";
import type { ReactNode } from "react";
import type { LegalSection } from "@/lib/i18n/dictionaries/types";

type InlineLink = {
  /** Plain-text label inside a paragraph that should become a link. */
  label: string;
  href: string;
};

type LegalSectionsProps = {
  sections: readonly LegalSection[];
  inlineLink?: InlineLink;
};

const EMAIL_OR_URL =
  /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+\/[\w\-./?%&=#]+)/g;

const linkClass = "text-terracotta underline-offset-2 hover:underline";

/** Turns bare email addresses and policy URLs in dictionary copy into anchors. */
function linkifyText(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  EMAIL_OR_URL.lastIndex = 0;

  while ((match = EMAIL_OR_URL.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.replace(/[.,;:)]+$/, "");
    const start = match.index;

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    const isEmail = Boolean(match[1]);
    const href = isEmail
      ? `mailto:${trimmed}`
      : trimmed.startsWith("http")
        ? trimmed
        : `https://${trimmed}`;

    nodes.push(
      <a
        key={`${keyPrefix}-${start}`}
        href={href}
        className={linkClass}
        {...(isEmail
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" as const })}
      >
        {trimmed}
      </a>,
    );

    lastIndex = start + trimmed.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length > 0 ? nodes : [text];
}

function renderParagraph(
  text: string,
  keyPrefix: string,
  inlineLink?: InlineLink,
) {
  if (inlineLink && text.includes(inlineLink.label)) {
    const [before, ...rest] = text.split(inlineLink.label);
    const after = rest.join(inlineLink.label);
    return (
      <>
        {linkifyText(before, `${keyPrefix}-before`)}
        <Link href={inlineLink.href} className={linkClass}>
          {inlineLink.label}
        </Link>
        {linkifyText(after, `${keyPrefix}-after`)}
      </>
    );
  }
  return <>{linkifyText(text, keyPrefix)}</>;
}

export function LegalSections({ sections, inlineLink }: LegalSectionsProps) {
  return (
    <>
      {sections.map((section, index) => {
        const [firstParagraph, ...restParagraphs] = section.paragraphs;
        const isCookies = /cookie/i.test(section.heading);
        return (
          <section
            key={section.heading}
            id={isCookies ? "cookies" : undefined}
            className={isCookies ? "scroll-mt-24" : undefined}
          >
            <h2 className="font-display text-2xl font-bold text-forest">
              {section.heading}
            </h2>

            {firstParagraph ? (
              <p className="mt-3">
                {renderParagraph(firstParagraph, `s${index}-p0`, inlineLink)}
              </p>
            ) : null}

            {section.list ? (
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {section.list.map((item, itemIndex) => (
                  <li key={item}>
                    {renderParagraph(item, `s${index}-l${itemIndex}`)}
                  </li>
                ))}
              </ul>
            ) : null}

            {restParagraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraph} className="mt-3">
                {renderParagraph(
                  paragraph,
                  `s${index}-p${paragraphIndex + 1}`,
                  inlineLink,
                )}
              </p>
            ))}
          </section>
        );
      })}
    </>
  );
}
