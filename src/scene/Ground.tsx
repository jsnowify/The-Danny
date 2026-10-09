import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, PlaneGeometry } from "three";
import { groundHeight, pathX } from "../utils/random";
import { useAssets } from "./resources";
export function Ground() {
  const assets = useAssets();
  const { ground, path } = useMemo(() => {
    const ground = new PlaneGeometry(220, 220, 100, 100);
    ground.rotateX(-Math.PI / 2);
    const p = ground.getAttribute("position");
    for (let i = 0; i < p.count; i++)
      p.setY(i, groundHeight(p.getX(i), p.getZ(i)));
    ground.computeVertexNormals();
    const path = new BufferGeometry(),
      points: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 100; i++) {
      const z = -100 + i * 2,
        x = pathX(z),
        width = 1.9 + Math.sin(z * 0.1) * 0.3;
      points.push(
        x - width,
        groundHeight(x - width, z) + 0.028,
        z,
        x + width,
        groundHeight(x + width, z) + 0.028,
        z,
      );
      if (i < 100)
        indices.push(
          i * 2,
          i * 2 + 2,
          i * 2 + 1,
          i * 2 + 1,
          i * 2 + 2,
          i * 2 + 3,
        );
    }
    path.setAttribute("position", new Float32BufferAttribute(points, 3));
    path.setIndex(indices);
    path.computeVertexNormals();
    return { ground, path };
  }, []);
  return (
    <group>
      <mesh
        geometry={ground}
        material={assets.materials.ground}
        receiveShadow
      />
      <mesh geometry={path} receiveShadow>
        <meshStandardMaterial color="#c4b68a" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <circleGeometry args={[6.8, 48]} />
        <meshStandardMaterial color="#aabd87" roughness={1} />
      </mesh>
    </group>
  );
}
