import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  DoubleSide,
  type Material,
  type Texture,
} from "three";
import { applyWindShader } from "../shaders/wind";
import { outlineMaterial } from "../shaders/outline";

/** Shared painted leaf surfaces, real branch pigment and alpha-correct shadows. */
export function createForestPaint(
  trees: Group[],
  approvedBark: MeshStandardMaterial,
  canopies: Texture[],
) {
  const originals = trees.map(
    (tree) =>
      (tree.getObjectByName("prototype-painted-crown") as Mesh)
        .material as MeshStandardMaterial[],
  );
  const bark = applyWindShader(approvedBark.clone(), false, 0.18);
  bark.name = "painted-moss-brown-bark";
  bark.color.set("#ffffff");
  const make = (name: string, variant: number, map: Texture) => {
    const front = originals[variant][0].clone();
    front.name = `painted-forest-${name}`;
    front.map = front.emissiveMap = map;
    front.alphaTest = 0.36;
    front.side = DoubleSide;
    front.emissive.set("#b2d991");
    front.emissiveIntensity = 0.035;
    front.toneMapped = false;
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
    front.customProgramCacheKey = () => `${key()}-summer-canopy-lit-v3-depth`;
    const edge = originals[variant][1].clone();
    edge.color.set("#286e50");
    applyWindShader(edge, true, 0.93);
    return [front, edge, bark];
  };
  // Existing palette slots keep species, world seeds and discovery locations stable.
  const palettes = {
    vermilion: make("emerald", 0, canopies[0]),
    honey: make("sunlit", 1, canopies[1]),
    sage: make("fern", 1, canopies[2]),
    teal: make("teal", 0, canopies[3]),
  };
  const outline = applyWindShader(outlineMaterial(), false);
  const depth = applyWindShader(
    new MeshDepthMaterial({
      map: canopies[0],
      alphaTest: 0.36,
      depthPacking: RGBADepthPacking,
      side: DoubleSide,
    }),
    false,
    0.18,
  );
  const compileDepth = depth.onBeforeCompile.bind(depth);
  const depthKey = depth.customProgramCacheKey.bind(depth);
  depth.onBeforeCompile = (shader, renderer) => {
    compileDepth(shader, renderer);
    shader.vertexShader = "varying float vCanopyAlpha;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvCanopyAlpha=aCanopy;",
    );
    shader.fragmentShader =
      "varying float vCanopyAlpha;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphatest_fragment>",
      "diffuseColor.a=mix(1.0,diffuseColor.a,vCanopyAlpha);\n#include <alphatest_fragment>",
    );
  };
  depth.customProgramCacheKey = () =>
    `${depthKey()}-leaf-alpha-and-solid-trunk-v1`;
  const shrub = applyWindShader(
    new MeshStandardMaterial({
      map: canopies[0],
      alphaTest: 0.36,
      side: DoubleSide,
      toneMapped: false,
      roughness: 1,
      emissive: "#456e49",
      emissiveIntensity: 0.035,
    }),
    true,
    0.93,
  );
  shrub.name = "painted-leafy-undergrowth";
  const shrubDepth = applyWindShader(
    new MeshDepthMaterial({
      map: canopies[0],
      alphaTest: 0.36,
      depthPacking: RGBADepthPacking,
      side: DoubleSide,
    }),
    false,
  );
  const owned = new Set<Material>([
    ...Object.values(palettes).flat(),
    outline,
    depth,
    shrub,
    shrubDepth,
  ]);
  return {
    palettes,
    bark,
    outline,
    depth,
    shrub,
    shrubDepth,
    dispose() {
      owned.forEach((material) => material.dispose());
    },
  };
}
