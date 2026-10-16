import type { CSSProperties } from "react";

interface Props {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** The Cavallery knight (♞) as a crisp SVG silhouette — never an emoji. */
export default function KnightSvg({ size = 24, className, style, title }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M30 80C31 70 33 64 37 59C30 59 23 57 17 54C12 52 11 46 14 42L27 30C30 27 33 25 36 23L38 9L46 18C57 18 67 25 73 36C79 47 79 63 73 80Z M31.4 34.2m-2.6 0a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z M54 30C60 35 63 42 64 50C61 43 57 37 51 32Z"
      />
      <path fill="currentColor" d="M24 83H76C78 83 79 85 79 87V90H21V87C21 85 22 83 24 83Z M17 92H83V97H17Z" />
    </svg>
  );
}
