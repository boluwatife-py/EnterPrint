export type ContentSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type ContentSectionsProps = {
  sections: ContentSection[];
  footnote?: string;
};

export function ContentSections({ sections, footnote }: ContentSectionsProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs?.map((p, i) => (
              <p
                key={i}
                className="mt-3 text-pretty leading-relaxed text-muted-foreground"
              >
                {p}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-4 flex flex-col gap-2">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-pretty leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      {footnote ? (
        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
