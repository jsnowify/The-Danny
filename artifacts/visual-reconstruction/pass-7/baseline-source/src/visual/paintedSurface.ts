import type { MeshStandardMaterial, Texture } from "three";

/** Small pigment fill and stable dry brush, preserving the underlying palette. */
export function paintedSurface<T extends MeshStandardMaterial>(
  material: T,
  map?: Texture,
  fill = 0.075,
) {
  if (map) material.map = map;
  material.roughness = 1;
  material.metalness = 0;
  material.flatShading = false;
  const compile = material.onBeforeCompile.bind(material);
  const cache = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    compile(shader, renderer);
    shader.vertexShader = "varying vec3 vPigmentLocal;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvPigmentLocal=position;",
    );
    shader.fragmentShader =
      "varying vec3 vPigmentLocal;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      float stroke=sin(vPigmentLocal.y*17.0+vPigmentLocal.x*3.0+sin(vPigmentLocal.z*9.0));
      float grain=fract(sin(dot(floor(vPigmentLocal*260.0),vec3(12.9898,78.233,37.719)))*43758.5453);
      diffuseColor.rgb*=.97+.025*stroke+.03*grain;
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*${fill.toFixed(3)};`,
    );
  };
  material.customProgramCacheKey = () =>
    `${cache()}-painted-surface-v1-${fill}`;
  return material;
}
