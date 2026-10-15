import KnightSvg from "./KnightSvg";

interface Props {
  /** Board square in algebraic notation, e.g. "e4". */
  square: string;
  label: string;
  className?: string;
}

/** Section label in chess notation: "♞ e4 — Informasi Terkini". */
export default function ChessEyebrow({ square, label, className }: Props) {
  return (
    <span className={`cv-eyebrow ${className || ""}`}>
      <KnightSvg size={14} style={{ color: "var(--cv-pink)" }} />
      <span className="cv-eyebrow__sq">{square}</span>
      <span className="cv-eyebrow__dash" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
