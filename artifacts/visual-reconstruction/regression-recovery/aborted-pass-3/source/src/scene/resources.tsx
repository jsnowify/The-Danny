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
import { groundMaterial } from "../shaders/ground";
import { outlineMaterial } from "../shaders/outline";
import { paintTexture } from "../textures/paintTexture";
import { memoryArt } from "../textures/memoryArt";
import { MEMORIES } from "../config";
import { grassStrokes, paintedCanopy, paintedLeaf } from "./paintedGeometry";
import { treeCrown, treeTrunk, treeUV } from "./treeGeometry";
import { treePaint } from "../textures/treePaint";

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
    pine: flex(
      treeCrown("spindle", false, 2).translate(0, 1, 0).scale(1, 0.5, 1),
      0.08,
      0,
      true,
    ),
    crown: flex(treeCrown("egg"), 0.06, 0, true),
    pineFar: flex(
      treeCrown("spindle", true, 2).translate(0, 1, 0).scale(1, 0.5, 1),
      0.08,
      0,
      true,
    ),
    crownFar: flex(treeCrown("egg", true), 0.06, 0, true),
    leaf: flex(treeUV(paintedLeaf(), 4), 0.18, 0, true),
    trunk: flex(treeTrunk(), 0),
    bush: flex(paintedCanopy().translate(0, 1, 0), 0.35),
    flower: flex(combine([stem, ...petals]), 0.6),
    mushroom: flex(combine([mushroomStem, cap]), 0.15),
    rock: flex(new IcosahedronGeometry(1, 0), 0),
    log: flex(log, 0),
    reed: flex(reed, 0.9),
    lily: flex(lily, 0),
  };
  const groundTexture = new CanvasTexture(paintTexture("ground"));
  groundTexture.wrapS = groundTexture.wrapT = RepeatWrapping;
  groundTexture.repeat.set(16, 16);
  groundTexture.colorSpace = SRGBColorSpace;
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
  const treeTexture = treePaint();
  const treeMaterial = applyWindShader(
    new MeshStandardMaterial({
      map: treeTexture,
      roughness: 1,
      side: DoubleSide,
      emissive: "#ffffff",
      emissiveMap: treeTexture,
      emissiveIntensity: 0.12,
    }),
    true,
    0.58,
    true,
  );
  const materials = {
    foliage: windMaterial(),
    canopy: treeMaterial,
    memoryLeaves: windMaterial(treeTexture),
    leaves: windMaterial(leafTexture),
    depth: applyWindShader(
      new MeshDepthMaterial({
        depthPacking: RGBADepthPacking,
        side: DoubleSide,
      }),
      false,
      0.18,
      true,
    ),
    ground: groundMaterial(groundTexture),
    outline: outlineMaterial(true),
    bark: treeMaterial,
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
    geometries,
    materials,
    groundTexture,
    paper,
    glow,
    pictures,
    leafTexture,
    treeTexture,
    pictureGeometry: new PlaneGeometry(1.05, 1.23),
    particleGeometry: new PlaneGeometry(1, 1),
  };
}
export type Assets = ReturnType<typeof buildResources>;
export const AssetsContext = createContext<Assets | null>(null);
export const useAssets = () => useContext(AssetsContext)!;
export function useResources() {
  const assets = useMemo(buildResources, []);
  useEffect(
    () => () => {
      Object.values(assets.geometries).forEach((g) => g.dispose());
      new Set(Object.values(assets.materials)).forEach((m) => m.dispose());
      [
        assets.groundTexture,
        assets.paper,
        assets.glow,
        assets.leafTexture,
        assets.treeTexture,
        ...assets.pictures,
      ].forEach((t) => t.dispose());
      assets.pictureGeometry.dispose();
      assets.particleGeometry.dispose();
    },
    [assets],
  );
  return assets;
}
