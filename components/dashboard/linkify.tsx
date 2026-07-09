// components/dashboard/linkify.tsx
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-primary-foreground/40 underline-offset-2 hover:decoration-primary-foreground"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
