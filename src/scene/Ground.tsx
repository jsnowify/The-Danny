import { useEffect, useMemo } from "react";
import { PlaneGeometry } from "three";
import { groundHeight } from "../utils/random";
import { useAssets } from "./resources";

export function Ground() {
  const assets = useAssets();
  const geometry = useMemo(() => {
    const ground = new PlaneGeometry(220, 220, 80, 80);
    ground.rotateX(-Math.PI / 2);
    const p = ground.getAttribute("position"),
      uv = ground.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      p.setY(i, groundHeight(p.getX(i), p.getZ(i)));
      // Preserve Pass 1's original 36-unit painting in the central clearing.
      uv.setXY(i, (p.getX(i) - 0.35) / 36 + 0.5, 0.5 - (p.getZ(i) - 1.6) / 36);
    }
    ground.computeVertexNormals();
    return ground;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // Path and clearing are pigment masks on the same surface. They cannot cut
  // through the terrain or produce a raised, perfectly circular disc.
  return (
    <mesh
      name="painted-ground"
      geometry={geometry}
      material={assets.materials.ground}
      receiveShadow
    />
  );
}
