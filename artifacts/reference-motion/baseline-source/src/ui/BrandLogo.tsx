import logoUrl from "../assets/blue-heaven-flower.svg";

/** The project emblem is decorative beside the existing names and labels. */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`}
      src={logoUrl}
      width={28}
      height={28}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
