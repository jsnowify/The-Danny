import { createContext, useContext, useEffect, useMemo } from "react";
import {
  BufferAttribute,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  CircleGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  SRGBColorSpace,
  RepeatWrapping,
  SphereGeometry,
  DoubleSide,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { BufferGeometry } from "three";
import { applyWindShader, windMaterial } from "../shaders/wind";
import { outlineMaterial } from "../shaders/outline";
import { paintTexture } from "../textures/paintTexture";
import { memoryArt } from "../textures/memoryArt";
import { MEMORIES } from "../config";
import { grassStrokes, paintedCanopy, paintedLeaf } from "./paintedGeometry";
import { createApprovedAssets } from "../visual/approved/assets";
import { createForestPaint } from "../visual/forestPaint";
import { curvedStem, forestCrown } from "./forestGeometry";

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
function combine(geometries: BufferGeometry[]) {
  const merged = mergeGeometries(geometries)!;
  geometries.forEach((g) => g.dispose());
  return merged;
}
function buildResources() {
  const approved = createApprovedAssets();
  approved.root.name = "approved-pass-1-foundation";
  approved.root.position.set(0.35, 0, 1.6);
  approved.ground.visible = false; // Same painted map extends over the walkable world.
  approved.memory.removeFromParent();
  approved.memory.name = "memory-tree-limbs";
  approved.memory.position.set(0, 0, 0);
  approved.traveler.removeFromParent();
  approved.traveler.position.set(0, 0, 0);
  approved.shadow.removeFromParent();
  approved.shadow.position.set(0, 0.012, 0);
  const trunk = curvedStem(0, 0, 0.08, 1, 1);
  const forest = createForestPaint(
    approved.trees,
    approved.memory.material as MeshStandardMaterial,
  );
  const stem = new CylinderGeometry(0.025, 0.04, 0.6, 4);
  stem.translate(0, 0.3, 0);
  const petals = Array.from({ length: 5 }, (_, i) => {
    const g = new SphereGeometry(0.12, 5, 3);
    g.scale(1, 0.45, 1);
    g.translate(Math.cos(i * 1.256) * 0.12, 0.65, Math.sin(i * 1.256) * 0.12);
    return g;
  });
  const mushroomStem = new CylinderGeometry(0.13, 0.17, 0.5, 7);
  mushroomStem.translate(0, 0.25, 0);
  const cap = new SphereGeometry(0.42, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(1, 0.7, 1);
  cap.translate(0, 0.52, 0);
  const reed = new ConeGeometry(0.08, 1.8, 3);
  reed.translate(0, 0.9, 0);
  const log = new CylinderGeometry(0.5, 0.5, 1.8, 7);
  log.rotateZ(Math.PI / 2);
  log.translate(0, 0.22, 0);
  const lily = new CircleGeometry(1, 12, 0.25, Math.PI * 2 - 0.5);
  lily.rotateX(-Math.PI / 2);
  const geometries = {
    grass: flex(grassStrokes(), 1, 1),
    pine: flex(forestCrown(1), 0.08, 0, true),
    crown: flex(forestCrown(0), 0.06, 0, true),
    pineFar: flex(forestCrown(1, true), 0.08, 0, true),
    crownFar: flex(forestCrown(0, true), 0.06, 0, true),
    leaf: flex(paintedLeaf(), 0.18, 0, true),
    trunk: flex(trunk, 0, 0, true),
    bush: flex(paintedCanopy().translate(0, 1, 0), 0.35),
    flower: flex(combine([stem, ...petals]), 0.6),
    mushroom: flex(combine([mushroomStem, cap]), 0.15),
    rock: flex(new IcosahedronGeometry(1, 0), 0),
    log: flex(log, 0),
    reed: flex(reed, 0.9),
    lily: flex(lily, 0),
  };
  const groundTexture = (approved.ground.material as MeshStandardMaterial).map!;
  const paper = new CanvasTexture(paintTexture("grain"));
  paper.wrapS = paper.wrapT = RepeatWrapping;
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
    foliage: windMaterial(),
    leaves: windMaterial(leafTexture),
    depth: applyWindShader(
      new MeshDepthMaterial({
        depthPacking: RGBADepthPacking,
        side: DoubleSide,
      }),
      false,
    ),
    ground: approved.ground.material as MeshStandardMaterial,
    outline: outlineMaterial(),
    bark: approved.memory.material as MeshStandardMaterial,
    paper: new MeshBasicMaterial({ color: "#fff1cc", side: DoubleSide }),
    glow: new MeshBasicMaterial({
      map: glow,
      transparent: true,
      depthWrite: false,
      color: "#ffe2a1",
      side: DoubleSide,
    }),
  };
  return {
    lease: 0,
    approved,
    forest,
    geometries,
    materials,
    groundTexture,
    paper,
    glow,
    pictures,
    leafTexture,
    pictureGeometry: new PlaneGeometry(1.05, 1.23),
    particleGeometry: new PlaneGeometry(1, 1),
  };
}
export type Assets = ReturnType<typeof buildResources>;
export const AssetsContext = createContext<Assets | null>(null);
export const useAssets = () => useContext(AssetsContext)!;
export function useResources() {
  const assets = useMemo(buildResources, []);
  useEffect(() => {
    const lease = ++assets.lease;
    return () =>
      queueMicrotask(() => {
        if (lease !== assets.lease) return;
        Object.values(assets.geometries).forEach((g) => g.dispose());
        new Set(Object.values(assets.materials)).forEach((m) => {
          if (
            m !== assets.approved.ground.material &&
            m !== assets.approved.memory.material
          )
            m.dispose();
        });
        [
          assets.paper,
          assets.glow,
          assets.leafTexture,
          ...assets.pictures,
        ].forEach((t) => t.dispose());
        assets.pictureGeometry.dispose();
        assets.particleGeometry.dispose();
        assets.forest.dispose();
        assets.approved.dispose();
      });
  }, [assets]);
  return assets;
}
