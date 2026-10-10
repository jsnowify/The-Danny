import { Color, MeshStandardMaterial, Vector3, type Texture } from "three";
import { COMPOSITION } from "../config";
import { REGIONS } from "../config/regions";

export const groundUniforms = {
  uMoss: { value: new Color("#828773") },
  uSage: { value: new Color("#aaa88b") },
  uPath: { value: new Color("#c5bba5") },
  uClearing: { value: new Color("#d4d1c9") },
  uClearingRadius: { value: COMPOSITION.clearingRadius },
  uPathWidth: { value: COMPOSITION.pathHalfWidth },
  uZones: {
    value: REGIONS.slice(1).map(
      (r) => new Vector3(r.center[0], r.center[1], r.radius),
    ),
  },
  uZonePigments: { value: REGIONS.slice(1).map((r) => new Color(r.ground)) },
};
export function groundMaterial(map: Texture) {
  const material = new MeshStandardMaterial({
    color: "#ffffff",
    map,
    roughness: 1,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, groundUniforms);
    shader.vertexShader = "varying vec3 vGround;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n vGround = position;",
    );
    shader.fragmentShader =
      `
      varying vec3 vGround;
      uniform vec3 uMoss, uSage, uPath, uClearing;
      uniform float uClearingRadius, uPathWidth;
      uniform vec3 uZones[7],uZonePigments[7];
      float paintHash(vec2 p) {return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float paintNoise(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(paintHash(i),paintHash(i+vec2(1,0)),f.x),mix(paintHash(i+vec2(0,1)),paintHash(i+1.0),f.x),f.y);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      vec2 p=vGround.xz;
      float broad=paintNoise(p*.12)*.65+paintNoise(p*.31)*.35;
      float brush=paintNoise(vec2(p.x*.22+p.y*.13,p.y*4.5));
      vec3 pigment=mix(uMoss,uSage,smoothstep(.2,.85,broad));
      vec3 regional=vec3(0.0);float zoneWeight=0.0;
      for(int i=0;i<7;i++) {
        float weight=1.0-smoothstep(uZones[i].z*.25,uZones[i].z*1.2,distance(p,uZones[i].xy));
        regional+=uZonePigments[i]*weight;zoneWeight+=weight;
      }
      pigment=mix(pigment,regional/max(zoneWeight,.001),min(zoneWeight,1.0)*.22);
      float pathCenter=sin(p.y*.063)*9.0;
      float uneven=(paintNoise(p*.85)-.5)*.28;
      float path=1.0-smoothstep(uPathWidth-.18,uPathWidth+.38,abs(p.x-pathCenter)+uneven);
      pigment=mix(pigment,uPath,path*.88);
      float boundary=length(p*vec2(1.0,1.035))+(paintNoise(p*.43)-.5)*.7;
      float clearing=1.0-smoothstep(uClearingRadius-.6,uClearingRadius+.55,boundary);
      pigment=mix(pigment,uClearing,clearing);
      diffuseColor.rgb *= pigment * (1.05+(brush-.5)*.13);
    `,
    );
  };
  material.customProgramCacheKey = () => "the-danny-painted-ground-v3-regions";
  return material;
}
