import { Fragment, type ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
}

/**
 * Splits text into masked words for GSAP per-word reveals (useReveal "words").
 * Server-renderable: the text is fully visible without JavaScript.
 * The space sits *outside* each mask so it is never clipped away.
 */
export default function SplitWords({ text, as: Tag = "span", className, wordClassName }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className={`cv-word ${wordClassName || ""}`}>
            <span className="cv-word__in">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
