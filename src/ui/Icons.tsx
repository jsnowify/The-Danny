import type { CSSProperties } from "react";
export type IconName =
  | "leaf"
  | "heart"
  | "sound"
  | "mute"
  | "headphones"
  | "eye"
  | "pause"
  | "arrow"
  | "close"
  | "compass"
  | "spark"
  | "book"
  | "fullscreen";
const paths: Record<IconName, React.ReactNode> = {
  book: (
    <>
      <path d="M3 5q5-2 9 1 4-3 9-1v15q-5-2-9 0-4-2-9 0Z" />
      <path d="M12 6v14" />
    </>
  ),
  fullscreen: <path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6" />,
  leaf: (
    <>
      <path d="M19 4C9 3 3 9 6 16c7 4 13-2 13-12Z" />
      <path d="M4 21 15 10" />
    </>
  ),
  heart: <path d="m12 20-8-8C-1 6 7 1 12 7c5-6 13-1 8 5Z" />,
  headphones: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="12" width="4" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sound: (
    <>
      <path d="M11 4 5 9H2v6h3l6 5Z" />
      <path d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" />
    </>
  ),
  mute: (
    <>
      <path d="M11 4 5 9H2v6h3l6 5Z" />
      <path d="m16 9 6 6m0-6-6 6" />
    </>
  ),
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 6-2 8-8 4 4-8Z" />
    </>
  ),
  spark: <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z" />,
};
export function Icon({
  name,
  style,
}: {
  name: IconName;
  style?: CSSProperties;
}) {
  return (
    <svg
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
