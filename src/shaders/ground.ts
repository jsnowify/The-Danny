import { MeshStandardMaterial, type Texture } from "three";
import { windUniforms } from "./wind";
export function groundMaterial(map: Texture) {
  const material = new MeshStandardMaterial({
    color: "#99b987",
    map,
    roughness: 1,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.vertexShader = "varying vec3 vGround;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n vGround = position;",
    );
    shader.fragmentShader =
      "varying vec3 vGround; uniform float uTime;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float stripe = pow(max(0.0, sin(vGround.x * .23 + vGround.z * .13 - uTime * .35)), 16.0);
      diffuseColor.rgb += stripe * .024;`,
    );
  };
  return material;
}
