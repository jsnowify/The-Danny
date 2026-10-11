import {
  CanvasTexture,
  DynamicDrawUsage,
  DoubleSide,
  InstancedBufferAttribute,
  LinearFilter,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import { FOREST_LIFE } from "../../config/forestLife";
import { breezeGLSL } from "../../scene/breeze";
import {
  BIRD_CELL,
  BIRD_COATS,
  BIRD_FRAMES,
  drawBird,
  drawBlueFlowers,
} from "./paint";

function texture(canvas: HTMLCanvasElement) {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.minFilter = map.magFilter = LinearFilter;
  map.generateMipmaps = false;
  return map;
}

export function birdFrame(time: number, phase: number, reduced: boolean) {
  if (reduced) return 0;
  const t = (time + phase) % 7;
  return t > 6.86
    ? 5
    : t > 6.4
      ? 4
      : t > 5.6
        ? 3
        : t > 4.85
          ? 2
          : t > 4.2
            ? 1
            : 0;
}

export function birdAssets(capacity: number) {
  const canvas = document.createElement("canvas");
  canvas.width = BIRD_CELL * BIRD_FRAMES;
  canvas.height = BIRD_CELL * BIRD_COATS.length;
  const ctx = canvas.getContext("2d")!;
  for (let coat = 0; coat < BIRD_COATS.length; coat++)
    for (let frame = 0; frame < BIRD_FRAMES; frame++) {
      ctx.save();
      ctx.translate(frame * BIRD_CELL, coat * BIRD_CELL);
      drawBird(ctx, coat, frame);
      ctx.restore();
    }
  const map = texture(canvas);
  map.name = "painted-perching-birds-atlas";
  const material = new MeshBasicMaterial({
    map,
    alphaTest: 0.25,
    toneMapped: false,
    side: DoubleSide,
  });
  material.name = "illustrated-tree-birds";
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = "attribute vec2 aBirdTile;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      `
      #include <uv_vertex>
      #ifdef USE_MAP
        vMapUv=(vMapUv+aBirdTile)/vec2(${BIRD_FRAMES.toFixed(1)},${BIRD_COATS.length.toFixed(1)});
      #endif
    `,
    );
  };
  material.customProgramCacheKey = () => "painted-birds-perch-and-flight-v2";
  const geometry = new PlaneGeometry(
    FOREST_LIFE.birdSize,
    FOREST_LIFE.birdSize,
  );
  geometry.translate(0, FOREST_LIFE.birdSize * (116 / BIRD_CELL - 0.5), 0);
  const tiles = new InstancedBufferAttribute(new Float32Array(capacity * 2), 2);
  geometry.setAttribute("aBirdTile", tiles);
  return {
    map,
    material,
    geometry,
    tiles,
    lease: 0,
    dispose() {
      map.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}

export function blueFlowerAssets() {
  const size = FOREST_LIFE.flowerSize;
  const geometry = new PlaneGeometry(size, size, 1, 8);
  geometry.translate(0, size * (116 / 128 - 0.5), 0);
  const contacts = Array.from({ length: 3 }, () =>
    new InstancedBufferAttribute(
      new Float32Array(FOREST_LIFE.flowerCapacity * 3),
      3,
    ).setUsage(DynamicDrawUsage),
  );
  const geometries = contacts.map((contact) => {
    const batch = geometry.clone();
    batch.setAttribute("aFlowerContact", contact);
    return batch;
  });
  geometry.dispose();
  const uniforms = {
    uMoonTime: { value: 0 },
    uMoonMotion: { value: 1 },
    uMoonGust: { value: 1 },
  };
  const maps = Array.from({ length: 3 }, (_, variant) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 384;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(3, 3);
    drawBlueFlowers(ctx, variant);
    const map = texture(canvas);
    map.name = `painted-blue-moon-flowers-${variant}`;
    return map;
  });
  const materials = maps.map((map, variant) => {
    const material = new MeshBasicMaterial({
      map,
      alphaTest: 0.25,
      toneMapped: false,
    });
    material.name = `illustrated-blue-moon-flowers-${variant}`;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        `uniform float uMoonTime, uMoonMotion, uMoonGust;\nattribute vec3 aFlowerContact;\n${breezeGLSL}\n` +
        shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        vec3 flowerCenter=vec3(0.0);
        #ifdef USE_INSTANCING
          flowerCenter=(instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
        #endif
        float rooted=pow(max(0.0,position.y)/${size.toFixed(2)},2.0);
        float wave=(breezeAt(flowerCenter.xz,uMoonTime)-.48)*.19;
        wave+=sin(uMoonTime*1.4+flowerCenter.x*.9+flowerCenter.z*.7)*.018;
        transformed.x+=rooted*wave*uMoonMotion*uMoonGust;
        // Contact is world-space so flowers part to either side of the walker.
        // Convert through the billboard basis without translating the root.
        vec3 brushing=vec3(aFlowerContact.x,-aFlowerContact.z,aFlowerContact.y);
        #ifdef USE_INSTANCING
          vec3 scaleSquared=vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz));
          brushing=transpose(mat3(instanceMatrix))*brushing/max(scaleSquared,vec3(.001));
        #endif
        transformed+=brushing*rooted;
      `,
      );
    };
    material.customProgramCacheKey = () => "painted-blue-moon-flowers-v3-gust";
    return material;
  });
  return {
    geometries,
    contacts,
    maps,
    materials,
    uniforms,
    lease: 0,
    dispose() {
      geometries.forEach((batch) => batch.dispose());
      maps.forEach((map) => map.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
