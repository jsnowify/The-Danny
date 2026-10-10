import {
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  Texture,
  type Camera,
} from "three";
import { random } from "../../utils/random";
import {
  barkPaint,
  clothPaint,
  crownPaint,
  groundPaint,
  leafPaint,
  rockPaint,
} from "./paint";
import {
  cloakGeometry,
  crownContour,
  crownShape,
  hatGeometry,
  illustratedVolume,
  leafGeometry,
  memoryTreeGeometry,
  smoothRock,
  stemGeometry,
} from "./geometry";

export const PROTOTYPE_INVENTORY = Object.freeze({
  memoryTrees: 1,
  surroundingTrees: 2,
  travelers: 1,
  rocks: 3,
  groundSurfaces: 1,
  leaves: 96,
  ambientParticles: 0,
});

export function createApprovedAssets() {
  const root = new Group();
  root.name = "visual-style-prototype";
  const maps: Texture[] = [],
    geometries = new Set<BufferGeometry>(),
    materials = new Set<Material>();
  const ownMap = (map: Texture) => {
    maps.push(map);
    return map;
  };
  const material = <T extends Material>(value: T) => {
    materials.add(value);
    return value;
  };
  function mesh(
    name: string,
    geometry: BufferGeometry,
    appearance: Material | Material[],
    parent: Group = root,
  ) {
    geometries.add(geometry);
    const object = new Mesh(geometry, appearance);
    object.name = name;
    parent.add(object);
    return object;
  }
  const groundMap = ownMap(groundPaint()),
    barkMap = ownMap(barkPaint()),
    clothMap = ownMap(clothPaint()),
    stoneMap = ownMap(rockPaint());
  const ground = mesh(
    "prototype-painted-ground",
    new PlaneGeometry(36, 36),
    material(
      new MeshStandardMaterial({
        map: groundMap,
        roughness: 1,
        metalness: 0,
        color: "#ffffff",
        emissive: "#b1b8a0",
        emissiveMap: groundMap,
        emissiveIntensity: 0.06,
      }),
    ),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  const bark = material(
    new MeshStandardMaterial({
      map: barkMap,
      roughness: 1,
      emissive: "#6b4b32",
      emissiveMap: barkMap,
      emissiveIntensity: 0.14,
    }),
  );
  const memory = mesh("prototype-memory-tree", memoryTreeGeometry(), bark);
  memory.position.set(-0.35, 0, -1.6);
  memory.castShadow = true;

  const trees: Group[] = [];
  for (let i = 0; i < 2; i++) {
    const tree = new Group();
    tree.name = `prototype-surrounding-tree-${i + 1}`;
    tree.position.set(i === 0 ? -5.8 : 5.6, 0, i === 0 ? -0.8 : 2.3);
    tree.rotation.x = -0.34;
    tree.rotation.z = i === 0 ? -0.025 : 0.025;
    tree.scale.setScalar(i === 0 ? 0.92 : 0.85);
    root.add(tree);
    trees.push(tree);
    const map = ownMap(crownPaint(i));
    const front = material(
      new MeshStandardMaterial({
        map,
        roughness: 1,
        emissive: "#ffaa60",
        emissiveMap: map,
        emissiveIntensity: 0.2,
      }),
    );
    const edge = material(
      new MeshStandardMaterial({
        color: i === 0 ? "#dc561f" : "#db702b",
        roughness: 1,
      }),
    );
    const shape = crownShape(i);
    const crown = mesh(
      "prototype-painted-crown",
      illustratedVolume(shape, [-2.2, 2.2, 0, 5.4], 0.26),
      [front, edge],
      tree,
    );
    crown.position.y = 1.95;
    crown.castShadow = true;
    const contour = mesh(
      "prototype-cream-contour",
      crownContour(shape),
      material(new MeshBasicMaterial({ color: "#ffdfad" })),
      tree,
    );
    contour.position.set(0, 1.95, 0);
    const stem = mesh(
      "prototype-illustrated-trunk",
      stemGeometry(),
      bark,
      tree,
    );
    stem.castShadow = true;
  }

  const rocks = new Group();
  rocks.name = "prototype-rock-group";
  root.add(rocks);
  const rockMaterial = material(
    new MeshStandardMaterial({
      map: stoneMap,
      roughness: 1,
      emissive: "#8e9bba",
      emissiveMap: stoneMap,
      emissiveIntensity: 0.11,
    }),
  );
  const rockPlacements = [
    { x: -1.65, z: -0.1, sx: 0.48, sy: 0.88, sz: 0.47 },
    { x: -1.13, z: 0.1, sx: 0.41, sy: 0.4, sz: 0.42 },
    { x: 1.16, z: -2.0, sx: 0.57, sy: 0.6, sz: 0.42 },
  ];
  rockPlacements.forEach((p, i) => {
    const object = mesh(
      `prototype-rock-${i + 1}`,
      smoothRock(i + 2),
      rockMaterial,
      rocks,
    );
    object.scale.set(p.sx, p.sy, p.sz);
    object.position.set(p.x, p.sy * 0.72, p.z);
    object.rotation.set(-0.35, i * 0.1 - 0.1, i * 0.09 - 0.08);
    object.castShadow = true;
    object.receiveShadow = true;
  });

  const traveler = new Group();
  traveler.name = "prototype-red-traveler";
  traveler.position.set(0.65, 0, 2.45);
  traveler.rotation.x = -0.49;
  traveler.scale.setScalar(0.85);
  root.add(traveler);
  const cloak = mesh(
    "prototype-embroidered-cloak",
    cloakGeometry(),
    material(
      new MeshStandardMaterial({
        map: clothMap,
        roughness: 1,
        emissive: "#ff8d5a",
        emissiveMap: clothMap,
        emissiveIntensity: 0.16,
        side: DoubleSide,
      }),
    ),
    traveler,
  );
  cloak.castShadow = true;
  const dark = material(new MeshBasicMaterial({ color: "#2b231b" }));
  const face = mesh(
    "prototype-shadow-face",
    new SphereGeometry(1, 20, 12),
    dark,
    traveler,
  );
  face.scale.set(0.17, 0.085, 0.095);
  face.position.set(0.01, 1.33, 0.06);
  const hat = mesh(
    "prototype-pointed-hat",
    hatGeometry(),
    material(
      new MeshStandardMaterial({
        color: "#f4541c",
        roughness: 1,
        emissive: "#ec4918",
        emissiveIntensity: 0.13,
      }),
    ),
    traveler,
  );
  hat.castShadow = true;
  for (const x of [-0.12, 0.14]) {
    const boot = mesh(
      "prototype-boot",
      new SphereGeometry(1, 12, 8),
      dark,
      traveler,
    );
    boot.scale.set(0.049, 0.12, 0.049);
    boot.position.set(x, 0.1, 0);
  }
  // Contact pigment keeps objects grounded without relying on a dark AO pass.
  const contact = material(
    new MeshBasicMaterial({
      color: "#586049",
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
    }),
  );
  const shadow = mesh(
    "prototype-traveler-contact",
    new CircleGeometry(0.46, 32),
    contact,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.65, 0.012, 2.45);
  shadow.scale.y = 0.55;

  const r = random(847),
    leaf = leafGeometry();
  geometries.add(leaf);
  const colors = ["#ffcd24", "#f4ab0f", "#ffe17b", "#ffc229", "#e99a14"];
  const leafMap = ownMap(leafPaint());
  const layers = [
    { count: 28, opacity: 0.43, scale: 0.12 },
    { count: 52, opacity: 0.9, scale: 0.16 },
    { count: 16, opacity: 0.62, scale: 0.19 },
  ];
  const currents = layers.map((layer, layerIndex) => {
    const appearance = material(
      new MeshBasicMaterial({
        color: "#ffffff",
        side: DoubleSide,
        map: leafMap,
        transparent: true,
        opacity: layer.opacity,
        depthWrite: false,
      }),
    );
    const object = new InstancedMesh(leaf, appearance, layer.count);
    object.name = `prototype-leaf-current-${layerIndex}`;
    object.frustumCulled = false;
    object.renderOrder = layerIndex;
    root.add(object);
    const particles = Array.from({ length: layer.count }, (_, i) => ({
      phase: r() * Math.PI * 2,
      speed: 0.055 + r() * 0.055,
      radius: 2.45 + r() * 1.9,
      height: 0.1 + r() * 1.4,
      turn: r() * 6.28,
      size: layer.scale * (0.65 + r() * 0.65),
      seed: i + layerIndex * 52,
    }));
    for (let i = 0; i < layer.count; i++)
      object.setColorAt(i, new Color(colors[(i + layerIndex) % colors.length]));
    object.instanceColor!.needsUpdate = true;
    return { object, particles, layer: layerIndex };
  });
  const scratch = new Object3D();
  let disposed = false;
  return {
    root,
    ground,
    memory,
    traveler,
    shadow,
    cloak,
    hat,
    trees,
    inventory: PROTOTYPE_INVENTORY,
    arrange(portrait: boolean) {
      trees[0].position.set(portrait ? -3.5 : -5.8, 0, portrait ? -1.8 : -0.8);
      trees[1].position.set(portrait ? 3.6 : 5.6, 0, portrait ? 3.9 : 2.3);
      trees[0].scale.setScalar(portrait ? 0.72 : 0.92);
      trees[1].scale.setScalar(portrait ? 0.68 : 0.85);
    },
    update(
      time: number,
      camera: Camera,
      reduced: boolean,
      player = { x: 0.65, z: 2.45 },
    ) {
      const t = reduced ? 0 : time;
      memory.rotation.z = Math.sin(t * 0.32) * 0.006;
      trees.forEach(
        (tree, i) =>
          (tree.rotation.z =
            (i === 0 ? -0.025 : 0.025) + Math.sin(t * 0.18 + i) * 0.006),
      );
      cloak.rotation.z = Math.sin(t * 0.75) * 0.023;
      hat.position.y = Math.sin(t * 0.75 + 0.6) * 0.014;
      for (const current of currents) {
        for (let i = 0; i < current.particles.length; i++) {
          const p = current.particles[i],
            a = p.phase + t * p.speed;
          const radius = p.radius + Math.sin(a * 2.3 + p.seed) * 0.4;
          const x =
            -0.35 + Math.cos(a) * radius + Math.sin(t * 0.14 + p.seed) * 0.23;
          const depth =
            current.layer === 0
              ? -Math.abs(Math.sin(a)) * radius * 0.75 - 1.8
              : current.layer === 2
                ? Math.abs(Math.sin(a)) * radius * 0.62 + 0.4
                : -1.3 + Math.sin(a) * radius * 0.69;
          const z = depth + Math.cos(a * 1.8 + p.seed) * 0.24;
          const height =
            current.layer === 0
              ? 0.65 + p.height * 0.5
              : current.layer === 2
                ? 0.15 + p.height * 0.35
                : 0.35 + p.height * 1.2;
          const y = Math.max(
            0.08,
            height +
              Math.sin(a * 1.5 + p.seed) * 0.22 +
              Math.sin(t * 0.22 + p.seed) * 0.14,
          );
          // A continuous opening around the cloak, rather than an occluding ring.
          const distance = Math.hypot(x - player.x, (z - player.z) * 0.85);
          const mask = Math.max(0, Math.min(1, (distance - 0.55) / 0.55));
          scratch.position.set(x, y, z);
          scratch.quaternion.copy(camera.quaternion);
          scratch.rotateZ(p.turn + t * 0.14 + Math.sin(a * 3) * 0.38);
          scratch.rotateY(Math.sin(t * 0.44 + p.seed) * 0.8);
          scratch.scale.set(
            p.size * mask,
            p.size *
              mask *
              (0.58 + Math.abs(Math.sin(t * 0.31 + p.seed)) * 0.35),
            p.size * mask,
          );
          scratch.updateMatrix();
          current.object.setMatrixAt(i, scratch.matrix);
        }
        current.object.instanceMatrix.needsUpdate = true;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      currents.forEach(({ object }) =>
        InstancedMesh.prototype.dispose.call(object),
      );
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      maps.forEach((map) => map.dispose());
      root.clear();
    },
  };
}
