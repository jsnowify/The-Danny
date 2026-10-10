import { PLANT_BY_ID, type PlantId } from "../config/flora";
const paths: Record<PlantId, string> = {
  narra:
    "M13 53Q5 25 30 29Q30 7 51 17Q72 7 75 29Q96 32 86 56Q65 68 50 55Q27 70 13 53Z",
  acacia:
    "M4 42Q0 27 23 26Q30 14 48 20Q67 13 77 26Q102 29 95 43Q77 51 50 48Q22 53 4 42Z",
  mango: "M18 63Q6 37 23 22Q36 7 54 13Q75 7 85 32Q98 61 75 68Q45 82 18 63Z",
  coconut:
    "M52 26Q23 3 3 24Q22 10 48 31Q9 28 8 50Q18 34 50 33Q84 7 98 29Q79 21 56 34Q91 34 91 54Q79 42 54 36Q54 7 68 8Q59 17 52 26Z",
  banana:
    "M47 79Q7 63 12 35Q31 38 47 70Q16 26 34 10Q47 28 51 63Q58 6 78 14Q78 39 54 71Q87 40 93 51Q79 78 47 79Z",
  bamboo:
    "M25 93V14H30V93ZM45 93V6H50V93ZM67 93V20H72V93ZM27 30L6 19L19 39ZM48 25L28 12L43 40ZM70 40L93 23L82 46ZM48 56L20 43L35 65ZM70 66L95 54L84 74Z",
  balete:
    "M8 56Q-1 32 25 26Q26 7 51 14Q76 6 78 30Q102 33 91 58Q75 70 49 61Q27 72 8 56Z",
  talisay:
    "M20 24Q50 8 80 24Q66 33 34 32ZM10 49Q50 30 90 47Q75 59 25 58ZM3 73Q48 56 97 72Q80 85 20 83Z",
  agoho:
    "M50 4L62 28L58 28L72 44L65 44L82 64L72 62L90 85Q50 99 10 85L28 62L18 64L35 44L28 44L42 28L38 28Z",
  kalachuchi: "M47 84Q26 79 23 61Q48 59 47 84ZM53 81Q57 56 79 55Q78 78 53 81Z",
  sampaguita: "M21 85Q5 56 33 50Q45 35 60 50Q95 55 83 84Q53 96 21 85Z",
  fern: "M50 95Q13 72 8 40Q39 54 50 86Q20 42 34 14Q52 35 52 80Q64 25 87 31Q85 61 53 91Q91 69 98 75Q88 94 50 95Z",
  gabi: "M29 73Q-5 53 11 32Q28 15 39 34Q55 14 59 38Q68 59 29 73ZM69 56Q38 31 58 15Q72 2 79 17Q97 5 99 30Q100 50 69 56Z",
  cogon:
    "M37 99Q19 62 22 28Q39 57 43 96Q34 36 47 9Q55 38 48 98Q66 56 80 47Q71 89 56 99Z",
  santan: "M15 91Q6 59 34 59Q50 48 70 59Q95 66 85 91Z",
  gumamela: "M21 91Q8 56 39 56Q52 44 72 58Q92 72 79 91Z",
};
export function PlantSilhouette({ id }: { id: PlantId }) {
  const plant = PLANT_BY_ID[id];
  const flowers =
    id === "kalachuchi"
      ? [
          [30, 48],
          [66, 38],
          [48, 22],
        ]
      : id === "sampaguita"
        ? [
            [28, 62],
            [62, 56],
            [51, 77],
          ]
        : id === "santan"
          ? [
              [35, 46],
              [52, 41],
              [65, 48],
              [46, 56],
            ]
          : id === "gumamela"
            ? [[54, 40]]
            : id === "narra"
              ? [
                  [25, 42],
                  [70, 45],
                ]
              : [];
  const color =
    id === "santan" || id === "gumamela"
      ? "#cc8b79"
      : id === "narra"
        ? "#dbc77a"
        : "#f3ecd6";
  return (
    <svg className="plant-silhouette" viewBox="0 0 100 110" aria-hidden="true">
      <g
        stroke="#71634a"
        strokeWidth={plant.tree ? 3 : 1.5}
        fill="none"
        strokeLinecap="round"
      >
        {id !== "bamboo" && (
          <path
            d={
              id === "coconut"
                ? "M46 101Q44 57 53 31"
                : "M50 101V40M50 74L26 53M50 68L75 43"
            }
          />
        )}
        {id === "balete" && (
          <path d="M21 52V91M31 58V94M69 55V94M79 50V91" strokeWidth={1.4} />
        )}
      </g>
      <path d={paths[id]} fill={plant.color} stroke="#e6dec3" strokeWidth={1} />
      <path
        d={
          plant.tree && id !== "bamboo" && id !== "coconut"
            ? "M50 92V38M50 64L27 46M50 53L72 38"
            : ""
        }
        fill="none"
        stroke="#65744d"
        strokeWidth={1.3}
      />
      {flowers.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {Array.from({ length: 5 }, (_, j) => (
            <ellipse
              key={j}
              cx={0}
              cy={-4}
              rx={id === "gumamela" ? 7 : 3.2}
              ry={id === "gumamela" ? 11 : 5}
              fill={color}
              transform={`rotate(${j * 72})`}
            />
          ))}
          <circle r={2} fill="#d9b872" />
        </g>
      ))}
    </svg>
  );
}
