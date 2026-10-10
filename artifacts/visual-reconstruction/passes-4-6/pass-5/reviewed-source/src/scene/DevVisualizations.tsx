import { useEffect, useMemo, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { COMPOSITION, MEMORIES } from "../config";
import { groundHeight } from "../utils/random";
import type { WorldData } from "./world";
import { worldCalibration } from "./calibration";

export function DevVisualizations({
  world,
  collisions,
  interactions,
  clearing,
}: {
  world: WorldData;
  collisions: boolean;
  interactions: boolean;
  clearing: boolean;
}) {
  const clearingRadius = worldCalibration?.enabled
    ? worldCalibration.clearingRadius
    : COMPOSITION.clearingRadius;
  const mesh = useRef<InstancedMesh>(null);
  const proxies = useMemo(
    () => Array.from(world.collisions.debugColliders ?? []),
    [world],
  );
  useEffect(() => {
    if (!mesh.current) return;
    const object = new Object3D();
    for (let i = 0; i < proxies.length; i++) {
      const proxy = proxies[i];
      object.position.set(
        proxy.x,
        groundHeight(proxy.x, proxy.z) + 0.07,
        proxy.z,
      );
      object.rotation.x = -Math.PI / 2;
      object.scale.setScalar(proxy.radius + 0.35);
      object.updateMatrix();
      mesh.current.setMatrixAt(i, object.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [proxies]);
  return (
    <group name="v4-development-guides">
      <instancedMesh
        name="v4-collision-guides"
        ref={mesh}
        args={[undefined, undefined, proxies.length]}
        visible={collisions}
        frustumCulled={false}
      >
        <ringGeometry args={[0.96, 1, 32]} />
        <meshBasicMaterial
          color="#e9a080"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </instancedMesh>
      <group name="v4-interaction-guides" visible={interactions}>
        {MEMORIES.map((memory) => (
          <mesh
            key={memory.id}
            position={[
              memory.position[0],
              groundHeight(...memory.position) + 0.08,
              memory.position[1],
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[3.14, 3.2, 48]} />
            <meshBasicMaterial
              color="#d6e8dc"
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[7.94, 8, 64]} />
          <meshBasicMaterial
            color="#ffd36b"
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      </group>
      <mesh
        name="v4-clearing-guide"
        visible={clearing}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
      >
        <ringGeometry args={[clearingRadius - 0.06, clearingRadius, 64]} />
        <meshBasicMaterial
          color="#eee6ff"
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
