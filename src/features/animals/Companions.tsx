import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, Object3D } from "three";
import { groundHeight } from "../../utils/random";
import { useAssets } from "../../scene/resources";
import { COMPANIONS } from "../../config/companions";
import { animals, companionFocus } from "./simulation";
import { Animal } from "./Animal";
import { traveler } from "../../scene/runtime";
import { useStore } from "../../store";
import type { WorldData } from "../../scene/world";
export function Companions({ world }: { world: WorldData }) {
  const elapsed = useRef(0);
  const shadows = useRef<InstancedMesh>(null),
    o = useMemo(() => new Object3D(), []),
    assets = useAssets();
  useFrame((_, delta) => {
    const s = useStore.getState();
    let count = 0;
    for (const c of COMPANIONS) {
      const a = animals.get(c.id);
      if (!a || !a.visible) continue;
      o.position.set(a.x, groundHeight(a.x, a.z) + 0.025, a.z);
      o.rotation.set(-Math.PI / 2, 0, a.yaw);
      o.scale.set(
        c.species === "cat" ? 0.5 : 0.75,
        c.species === "cat" ? 0.7 : 1,
        1,
      );
      o.updateMatrix();
      shadows.current!.setMatrixAt(count++, o.matrix);
    }
    shadows.current!.count = count;
    shadows.current!.instanceMatrix.needsUpdate = true;
    if (
      s.phase !== "explore" ||
      s.paused ||
      s.fieldGuideOpen ||
      s.journalOpen ||
      s.dedicationOpen ||
      s.companionDialogue ||
      s.oscarDialogue
    )
      return;
    elapsed.current += Math.min(delta, 0.1);
    if (elapsed.current < 0.35) return;
    elapsed.current = 0;
    let nearest: string | null = null,
      best = 2.7;
    const found: string[] = [];
    const nearby: string[] = [];
    let follower: string | null = null,
      followDistance = 5;
    for (const a of animals.values()) {
      const d = Math.hypot(a.x - traveler.x, a.z - traveler.z);
      if (d < followDistance) {
        followDistance = d;
        follower = a.id;
      }
      if (d < 4.2) found.push(a.id);
      if (d < 2.7) nearby.push(a.id);
      if (d < best) {
        best = d;
        nearest = a.id;
      }
    }
    companionFocus.follower = follower;
    if (!world.calibrated) s.discoverCompanions(found);
    if (nearest !== s.nearCompanion)
      useStore.setState({ nearCompanion: nearest });
    if (nearby.join(",") !== s.nearCompanions.join(","))
      useStore.setState({ nearCompanions: nearby });
  });
  return (
    <group name="forest-companions">
      <instancedMesh
        ref={shadows}
        args={[undefined, undefined, COMPANIONS.length]}
        frustumCulled={false}
      >
        <circleGeometry args={[1, 16]} />
        <meshBasicMaterial
          color="#33382b"
          map={assets.glow}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </instancedMesh>
      {COMPANIONS.map((c) => (
        <Animal key={c.id} companion={c} world={world} />
      ))}
    </group>
  );
}
