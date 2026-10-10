import { BufferAttribute, BufferGeometry, DynamicDrawUsage } from "three";

/** Subdivide only long cloth faces. Resting silhouette and painted UVs are exact. */
export function movingCloth(source: BufferGeometry) {
  const original = source.index ? source.toNonIndexed() : source;
  const p = original.getAttribute("position"),
    normal = original.getAttribute("normal"),
    uv = original.getAttribute("uv");
  const positions: number[] = [],
    normals: number[] = [],
    coordinates: number[] = [];
  type Vertex = number[];
  const vertex = (i: number): Vertex => [
    p.getX(i),
    p.getY(i),
    p.getZ(i),
    normal.getX(i),
    normal.getY(i),
    normal.getZ(i),
    uv.getX(i),
    uv.getY(i),
  ];
  const midpoint = (a: Vertex, b: Vertex) => a.map((v, i) => (v + b[i]) * 0.5);
  const length = (a: Vertex, b: Vertex) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const triangle = (a: Vertex, b: Vertex, c: Vertex, depth: number) => {
    const lengths = [length(a, b), length(b, c), length(c, a)];
    const longest = Math.max(...lengths);
    if (longest > 0.16 && depth < 5) {
      const edge = lengths.indexOf(longest);
      if (edge === 0) {
        const m = midpoint(a, b);
        triangle(a, m, c, depth + 1);
        triangle(m, b, c, depth + 1);
      } else if (edge === 1) {
        const m = midpoint(b, c);
        triangle(a, b, m, depth + 1);
        triangle(a, m, c, depth + 1);
      } else {
        const m = midpoint(c, a);
        triangle(a, b, m, depth + 1);
        triangle(m, b, c, depth + 1);
      }
      return;
    }
    for (const v of [a, b, c]) {
      positions.push(...v.slice(0, 3));
      normals.push(...v.slice(3, 6));
      coordinates.push(...v.slice(6, 8));
    }
  };
  for (let i = 0; i < p.count; i += 3)
    triangle(vertex(i), vertex(i + 1), vertex(i + 2), 0);
  if (original !== source) original.dispose();
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3).setUsage(
      DynamicDrawUsage,
    ),
  );
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array(normals), 3),
  );
  geometry.setAttribute(
    "uv",
    new BufferAttribute(new Float32Array(coordinates), 2),
  );
  geometry.computeBoundingSphere();
  geometry.boundingSphere!.radius += 0.25;
  const rest = new Float32Array(positions);
  return { geometry, rest };
}

export function deformCloth(
  cloth: ReturnType<typeof movingCloth>,
  sideways: number,
  trailing: number,
  time: number,
  gait: number,
  speed: number,
  wind: number,
  reduced: boolean,
) {
  const p = cloth.geometry.getAttribute("position"),
    rest = cloth.rest;
  for (let i = 0; i < p.count; i++) {
    const x = rest[i * 3],
      y = rest[i * 3 + 1],
      z = rest[i * 3 + 2];
    const hem = Math.max(0, Math.min(1, (1.08 - y) / 0.9));
    const weight = hem * hem;
    const flutter = reduced
      ? 0
      : Math.sin(time * 1.7 + x * 5.2) * 0.008 * wind +
        (Math.sin(gait + x * 3.5) * 0.014 * speed) / 4.4;
    p.setXYZ(
      i,
      x + weight * (sideways + flutter),
      y +
        weight *
          (Math.sin(time * 1.3 + x * 4) * 0.004 * wind +
            Math.abs(sideways) * 0.045),
      z + weight * (trailing + flutter * 0.4),
    );
  }
  p.needsUpdate = true;
}
