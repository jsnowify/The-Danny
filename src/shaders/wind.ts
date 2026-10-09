import { MeshStandardMaterial, Vector2 } from "three";
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.6 },
  uPlayer: { value: new Vector2() },
};
export function windMaterial() {
  const material = new MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.92,
    flatShading: true,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, windUniforms);
    shader.vertexShader =
      "uniform float uTime; uniform float uWind; uniform vec2 uPlayer; attribute float aFlex; attribute float aGrass; attribute float aCanopy; varying float vOcclusion;\n" +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vec3 base = position;
      #ifdef USE_INSTANCING
        base = (instanceMatrix * vec4(position, 1.0)).xyz;
      #endif
      float distanceToPlayer = distance(base.xz, uPlayer);
      vOcclusion = aCanopy * (1.0-smoothstep(1.0,6.5,distanceToPlayer)) * step(uPlayer.y+.5,base.z);
      float lod = 1.0 - smoothstep(23.0, 53.0, distanceToPlayer);
      transformed *= mix(1.0, lod, aGrass);
      float sway = sin(uTime * 1.5 + base.x * .35 + base.z * .24);
      transformed.x += sway * aFlex * uWind * .32;
      transformed.z += cos(uTime * 1.2 + base.x * .2) * aFlex * uWind * .18;
      float wake = (1.0 - smoothstep(.2, 2.5, distanceToPlayer)) * aGrass;
      transformed.x += sin(base.x * 7.0 + uTime * 3.0) * wake * .28;
    `,
    );
    shader.fragmentShader =
      "varying float vOcclusion;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphatest_fragment>",
      `#include <alphatest_fragment>
      float stipple=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
      if(stipple < vOcclusion*.85) discard;`,
    );
  };
  material.customProgramCacheKey = () => "the-danny-wind-v1";
  return material;
}
