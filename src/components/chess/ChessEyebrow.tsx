import KnightSvg from "./KnightSvg";

interface Props {
  /** Kept for API compatibility; no longer rendered. */
  square?: string;
  label: string;
  className?: string;
}

/** Section label: "♞ — Informasi Terkini". */
export default function ChessEyebrow({ label, className }: Props) {
  return (
    <span className={`cv-eyebrow ${className || ""}`}>
      <KnightSvg size={14} style={{ color: "var(--cv-orange)" }} />
      <span className="cv-eyebrow__dash" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
