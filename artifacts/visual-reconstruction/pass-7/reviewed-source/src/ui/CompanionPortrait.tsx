import type { Companion } from "../config/companions";
export function CompanionPortrait({ companion: c }: { companion: Companion }) {
  const dog = c.species === "dog";
  return (
    <svg
      viewBox="0 0 160 120"
      role="img"
      aria-label={`${c.name}: ${c.appearance}`}
    >
      <ellipse cx="80" cy="110" rx="47" ry="5" fill="#34352c" opacity=".12" />
      <ellipse
        cx="80"
        cy="85"
        rx={c.build === "sturdy" ? 36 : 27}
        ry="25"
        fill={c.coat}
      />
      <ellipse cx="80" cy="59" rx={dog ? 29 : 31} ry="27" fill={c.coat} />
      {[-1, 1].map((s) =>
        dog ? (
          <ellipse
            key={s}
            cx={80 + s * 29}
            cy="63"
            rx="9"
            ry="24"
            fill={c.marking}
          />
        ) : (
          <path
            key={s}
            d={`M${80 + s * 24} 47 L${80 + s * 27} 16 L${80 + s * 5} 38Z`}
            fill={c.pattern === "points" ? c.marking : c.coat}
          />
        ),
      )}
      {c.pattern === "tabby" && (
        <path
          d="M63 34l5 13m12-17v16m17-12l-5 13M50 62l13 4m47-4l-13 4"
          stroke={c.marking}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <ellipse
        cx="80"
        cy="74"
        rx="18"
        ry="12"
        fill={
          c.pattern === "tuxedo" || c.pattern === "points" ? c.marking : c.coat
        }
      />
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={80 + s * 15} cy="58" rx="6" ry="7" fill={c.eyes} />
          <ellipse cx={80 + s * 15} cy="59" rx="2" ry="5" fill="#30332c" />
        </g>
      ))}
      <path d="M75 71h10l-5 5Z" fill={dog ? "#34342c" : "#b58277"} />
      <path
        d="M80 76v4m-6 0q6 7 12 0"
        stroke="#74654f"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
