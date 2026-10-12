import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshStandardMaterial,
  RGBADepthPacking,
  Object3D,
  PlaneGeometry,
  Texture,
  type Camera,
} from "three";
import { random } from "../../utils/random";
import { curvedStem } from "../../scene/forestGeometry";
import { paintedBranchTip } from "../../features/forestLife/layout";
import { applyWindShader } from "../../shaders/wind";
import {
  barkPaint,
  crownPaint,
  groundPaint,
  leafPaint,
  rockPaint,
} from "./paint";
import {
  crownContour,
  crownShape,
  illustratedVolume,
  leafGeometry,
  memoryTreeGeometry,
  smoothRock,
  stemGeometry,
} from "./geometry";

export const PROTOTYPE_INVENTORY = Object.freeze({
  memoryTrees: 1,
  surroundingTrees: 2,
  rocks: 3,
  groundSurfaces: 1,
  leaves: 96,
  ambientParticles: 0,
});

export function createApprovedAssets(foliage?: Texture[]) {
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
    barkMap = ownMap(barkPaint(!!foliage)),
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
      emissive: foliage ? "#759478" : "#6b4b32",
      emissiveMap: barkMap,
      emissiveIntensity: foliage ? 0.08 : 0.14,
    }),
  );
  const memory = mesh("prototype-memory-tree", memoryTreeGeometry(), bark);
  if (foliage) applyWindShader(bark, false, 0.18);
  memory.position.set(-0.35, 0, -1.6);
  memory.castShadow = true;
  memory.receiveShadow = true;

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
    const map = foliage?.[i] ?? ownMap(crownPaint(i));
    const front = material(
      new MeshStandardMaterial({
        map,
        roughness: 1,
        emissive: "#ffaa60",
        emissiveMap: map,
        emissiveIntensity: 0.2,
        ...(foliage
          ? {
              alphaTest: 0.36,
              side: DoubleSide,
              toneMapped: false,
              emissive: "#b2d991",
              emissiveIntensity: 0.035,
            }
          : {}),
      }),
    );
    const edge = material(
      new MeshStandardMaterial({
        color: i === 0 ? "#dc561f" : "#db702b",
        roughness: 1,
      }),
    );
    const shape = crownShape(i);
    if (foliage) {
      applyWindShader(front, true, 0.93);
      const compile = front.onBeforeCompile.bind(front);
      const key = front.customProgramCacheKey.bind(front);
      front.onBeforeCompile = (shader, renderer) => {
        compile(shader, renderer);
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <opaque_fragment>",
          "outgoingLight=mix(outgoingLight,diffuseColor.rgb,.08); outgoingLight*=mix(vec3(.72,.90,1.0),vec3(1.05,1.04,.96),smoothstep(.08,.9,vMapUv.x)*smoothstep(.05,.70,vMapUv.y));\n#include <opaque_fragment>",
        );
      };
      front.customProgramCacheKey = () =>
        `${key()}-summer-clearing-canopy-lit-v3-depth`;
    }
    const crown = mesh(
      "prototype-painted-crown",
      foliage
        ? new PlaneGeometry(
            5.4 * (foliage[i].image.width / foliage[i].image.height),
            5.4,
            8,
            10,
          ).translate(0, 2.7, 0.28)
        : illustratedVolume(shape, [-2.2, 2.2, 0, 5.4], 0.26),
      [front, edge],
      tree,
    );
    crown.position.y = 1.95;
    if (foliage) {
      const p = crown.geometry.getAttribute("position"),
        uv = crown.geometry.getAttribute("uv");
      for (let vertex = 0; vertex < p.count; vertex++)
        p.setZ(
          vertex,
          p.getZ(vertex) +
            Math.sin(uv.getX(vertex) * Math.PI) *
              Math.sin(uv.getY(vertex) * Math.PI) *
              0.6,
        );
      crown.geometry.computeVertexNormals();
      crown.geometry.addGroup(0, crown.geometry.index!.count, 0);
      const count = crown.geometry.getAttribute("position").count;
      crown.geometry.setAttribute(
        "aCanopy",
        new BufferAttribute(new Float32Array(count).fill(1), 1),
      );
      crown.geometry.setAttribute(
        "aFlex",
        new BufferAttribute(new Float32Array(count), 1),
      );
      crown.geometry.setAttribute(
        "aGrass",
        new BufferAttribute(new Float32Array(count), 1),
      );
    }
    crown.castShadow = true;
    crown.receiveShadow = true;
    if (foliage)
      crown.customDepthMaterial = material(
        new MeshDepthMaterial({
          map,
          alphaTest: 0.36,
          side: DoubleSide,
          depthPacking: RGBADepthPacking,
        }),
      );
    const contour = mesh(
      "prototype-cream-contour",
      crownContour(shape),
      material(new MeshBasicMaterial({ color: "#ffdfad" })),
      tree,
    );
    contour.position.set(0, 1.95, 0);
    contour.visible = !foliage;
    const stem = mesh(
      "prototype-illustrated-trunk",
      stemGeometry(),
      bark,
      tree,
    );
    stem.castShadow = true;
    stem.receiveShadow = true;
    if (foliage) {
      const upper = mesh(
        "painted-crown-fork",
        curvedStem(0, 1.8, 0.12, 5.4, 0.08).translate(0, 0, 0.06),
        bark,
        tree,
      );
      upper.castShadow = true;
      upper.receiveShadow = true;
      const tip = paintedBranchTip(i, i === 0 ? 1 : 0, i === 0 ? 1 : -1);
      const branch = mesh(
        "painted-bird-perch",
        curvedStem(0.02, tip.y - 0.72, tip.x, tip.y, 0.042).translate(
          0,
          0,
          0.19,
        ),
        bark,
        tree,
      );
      branch.castShadow = true;
      branch.receiveShadow = true;
      const side = i === 0 ? 1 : -1;
      const perch = mesh(
        "painted-perch-twig",
        curvedStem(
          tip.x - side * 0.18,
          tip.y - 0.06,
          tip.x,
          tip.y,
          0.018,
        ).translate(0, 0, tip.z),
        bark,
        tree,
      );
      perch.castShadow = true;
      perch.receiveShadow = true;
    }
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

  const r = random(847),
    leaf = leafGeometry();
  geometries.add(leaf);
  const colors = foliage
    ? ["#edf4ca", "#d8ecd0", "#bde0bf", "#f5f2d4", "#d1e8c8"]
    : ["#ffcd24", "#f4ab0f", "#ffe17b", "#ffc229", "#e99a14"];
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
      memory.rotation.z = foliage ? 0 : Math.sin(t * 0.32) * 0.006;
      trees.forEach(
        (tree, i) =>
          (tree.rotation.z =
            (i === 0 ? -0.025 : 0.025) + Math.sin(t * 0.18 + i) * 0.006),
      );
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
