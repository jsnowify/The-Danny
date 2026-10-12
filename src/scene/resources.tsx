import { createContext, useContext, useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import {
  BufferAttribute,
  CanvasTexture,
  PlaneGeometry,
  MeshStandardMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  SRGBColorSpace,
  DoubleSide,
  TextureLoader,
  type BufferGeometry,
  type Mesh,
  type Texture,
} from "three";
import { applyWindShader, grassMaterial, windMaterial } from "../shaders/wind";
import { paintTexture } from "../textures/paintTexture";
import { memoryArt } from "../textures/memoryArt";
import { MEMORIES } from "../config";
import { grassStrokes, paintedLeaf } from "./paintedGeometry";
import { createApprovedAssets } from "../visual/approved/assets";
import { createForestPaint } from "../visual/forestPaint";
import { curvedStem, forestCrown } from "./forestGeometry";
import { landscapePaint } from "../visual/landscapePaint";
import { memoryCurrent } from "../visual/memoryCurrent";
import { createPropPaint } from "../visual/propPaint";
import { brushShrub } from "./propGeometry";
import { forestProps } from "../visual/forestProps";
import { groundHeight } from "../utils/random";
import { forestCanopies } from "../visual/forestCanopies";

function flex(
  geometry: BufferGeometry,
  strength: number,
  grass = 0,
  isCanopy = false,
) {
  const positions = geometry.getAttribute("position"),
    values = new Float32Array(positions.count),
    lod = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    values[i] = Math.max(0, positions.getY(i)) * strength;
    lod[i] = grass;
  }
  const canopy = new Float32Array(positions.count);
  if (isCanopy) canopy.fill(1);
  geometry.setAttribute("aFlex", new BufferAttribute(values, 1));
  geometry.setAttribute("aGrass", new BufferAttribute(lod, 1));
  geometry.setAttribute("aCanopy", new BufferAttribute(canopy, 1));
  return geometry;
}
function buildResources(source: Texture) {
  const canopies = forestCanopies(source.image);
  const approved = createApprovedAssets(canopies);
  approved.root.name = "approved-pass-1-foundation";
  approved.root.position.set(0.35, 0, 1.6);
  approved.ground.visible = false; // Same painted map extends over the walkable world.
  approved.memory.removeFromParent();
  approved.memory.name = "memory-tree-limbs";
  approved.memory.position.set(0, 0, 0);
  const trunk = curvedStem(0, 0, 0.08, 1, 1);
  const forest = createForestPaint(
    approved.trees,
    approved.memory.material as MeshStandardMaterial,
    canopies,
  );
  const current = memoryCurrent(approved.root);
  const props = createPropPaint(approved.root);
  const drawings = forestProps();
  for (let i = 1; i <= 3; i++) {
    const rock = approved.root.getObjectByName(`prototype-rock-${i}`) as Mesh;
    rock.geometry = drawings.geometries.rock;
    rock.material = drawings.materials.rock;
    rock.rotation.set(0, 0, 0);
    rock.position.y =
      groundHeight(rock.position.x + 0.35, rock.position.z + 1.6) + 0.015;
  }
  const geometries = {
    grass: flex(grassStrokes(true), 1, 1),
    pine: flex(forestCrown(1), 0.08, 0, true),
    crown: flex(forestCrown(0), 0.06, 0, true),
    pineFar: flex(forestCrown(1, true), 0.08, 0, true),
    crownFar: flex(forestCrown(0, true), 0.06, 0, true),
    leaf: flex(paintedLeaf(), 0.18, 0, true),
    trunk: flex(trunk, 0),
    bush: flex(brushShrub(), 0.3, 1),
    ...drawings.geometries,
  };
  const landscape = landscapePaint(
    approved.ground.material as MeshStandardMaterial,
  );
  const glow = new CanvasTexture(paintTexture("glow"));
  glow.colorSpace = SRGBColorSpace;
  const pictures = MEMORIES.map((_, i) => {
    const t = new CanvasTexture(memoryArt(i));
    t.colorSpace = SRGBColorSpace;
    return t;
  });
  const leafTexture = new CanvasTexture(paintTexture("leaf"));
  leafTexture.colorSpace = SRGBColorSpace;
  const materials = {
    foliage: grassMaterial(),
    leaves: windMaterial(leafTexture),
    depth: applyWindShader(
      new MeshDepthMaterial({
        depthPacking: RGBADepthPacking,
        side: DoubleSide,
      }),
      false,
    ),
    ground: landscape.material,
  };
  return {
    lease: 0,
    approved,
    forest,
    canopies,
    current,
    props,
    drawings,
    landscape,
    geometries,
    materials,
    glow,
    pictures,
    leafTexture,
    pictureGeometry: new PlaneGeometry(1.05, 1.23),
  };
}
export type Assets = ReturnType<typeof buildResources>;
export const AssetsContext = createContext<Assets | null>(null);
export const useAssets = () => useContext(AssetsContext)!;
export function useResources() {
  const source = useLoader(TextureLoader, "/art/forest/summer-canopy.png");
  const assets = useMemo(() => buildResources(source), [source]);
  useEffect(() => {
    const lease = ++assets.lease;
    return () =>
      queueMicrotask(() => {
        if (lease !== assets.lease) return;
        Object.values(assets.geometries).forEach((g) => g.dispose());
        new Set(Object.values(assets.materials)).forEach((m) => {
          if (
            m !== assets.approved.ground.material &&
            m !== assets.landscape.material &&
            m !== assets.approved.memory.material
          )
            m.dispose();
        });
        [assets.glow, assets.leafTexture, ...assets.pictures].forEach((t) =>
          t.dispose(),
        );
        assets.pictureGeometry.dispose();
        assets.forest.dispose();
        assets.current.dispose();
        assets.props.dispose();
        assets.drawings.dispose();
        assets.landscape.dispose();
        assets.approved.dispose();
        assets.canopies.forEach((map) => map.dispose());
      });
  }, [assets]);
  return assets;
}
