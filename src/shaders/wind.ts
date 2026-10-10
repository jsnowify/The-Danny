import {
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshDepthMaterial,
  Vector2,
  Vector3,
  type Texture,
} from "three";
import { breeze, breezeGLSL } from "../scene/breeze";
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.6 },
  uObstructionFade: { value: 0.68 },
  uPlayer: { value: new Vector2() },
  uCamera: { value: new Vector3() },
  uViewRay: { value: new Vector3() },
  uParallel: { value: 1 },
  uPlayerHeight: { value: 0.8 },
  uRevivalRadius: { value: 0 },
  uWindDirection: { value: breeze.direction },
  uTrail: { value: breeze.trail },
};

export function applyWindShader<
  T extends MeshStandardMaterial | MeshBasicMaterial | MeshDepthMaterial,
>(
  material: T,
  revival = true,
  dormantSaturation = 0.18,
  clearTraveler = false,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, windUniforms);
    shader.vertexShader =
      `
      uniform float uTime, uWind, uPlayerHeight;
      uniform vec2 uPlayer, uWindDirection; uniform vec4 uTrail[4];
      uniform vec3 uCamera, uViewRay; uniform float uParallel;
      attribute float aFlex, aGrass, aCanopy;
      varying float vOcclusion, vForestDistance;
      ${clearTraveler ? "varying vec3 vTreePosition; varying float vTreeMask;" : ""}
      ${breezeGLSL}
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vec3 base=position, center=vec3(0.0);
      #ifdef USE_INSTANCING
        base=(instanceMatrix*vec4(position,1.0)).xyz;
        center=(instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
      #endif
      base=(modelMatrix*vec4(base,1.0)).xyz;
      center=(modelMatrix*vec4(center,1.0)).xyz;
      ${clearTraveler ? "vTreePosition=base; vTreeMask=aCanopy;" : ""}
      vForestDistance=length(base.xz);
      float distanceToPlayer=distance(base.xz,uPlayer);
      vec3 player=vec3(uPlayer.x,uPlayerHeight,uPlayer.y);
      vec3 ray=mix(uCamera-player,uViewRay,uParallel);
      // Test the actual foliage surface, including tall tapered crowns whose
      // instance origin lies below the part crossing the traveler.
      float along=clamp(dot(base-player,ray)/max(dot(ray,ray),.001),0.0,1.0);
      float obstruction=length(base-(player+along*ray));
      vOcclusion=aCanopy*(1.0-smoothstep(.65,2.1,obstruction))*smoothstep(.02,.14,along)*(1.0-smoothstep(.85,1.0,along));
      float lod=1.0-smoothstep(18.0,32.0,distanceToPlayer);
      transformed*=mix(1.0,lod,aGrass);
      if (uWind>.001) {
      float flowing=breezeAt(center.xz,uTime);
      float flutter=sin(uTime*3.1+center.x*.73+center.z*.51)*.018;
      vec3 windAxis=vec3(uWindDirection.x,0.0,uWindDirection.y);
      #ifdef USE_INSTANCING
        windAxis=normalize(transpose(mat3(instanceMatrix))*windAxis);
      #endif
      // Quadratic grass weighting pins every root. Trees retain their small
      // authored flex: heavy stems barely move while outer foliage yields.
      float weight=mix(aFlex,aFlex*aFlex,aGrass);
      transformed+=windAxis*weight*uWind*(flowing*.13+flutter*aGrass);
      if (aGrass>.5) {
      vec2 disturbance=vec2(0.0);
      for(int mark=0;mark<4;mark++) {
        float age=max(0.0,uTime-uTrail[mark].z);
        vec2 away=center.xz-uTrail[mark].xy;
        float nearby=1.0-smoothstep(.15,.85,length(away));
        disturbance+=away/max(.15,length(away))*nearby*exp(-age*3.0)*uTrail[mark].w*.085;
      }
      vec3 brushing=vec3(disturbance.x,0.0,disturbance.y);
      #ifdef USE_INSTANCING
        brushing=transpose(mat3(instanceMatrix))*brushing;
      #endif
      transformed+=brushing*weight*aGrass*step(.001,uWind);
      }
      }
    `,
    );
    shader.fragmentShader =
      `varying float vOcclusion, vForestDistance; uniform float uObstructionFade, uRevivalRadius;\n` +
      (clearTraveler
        ? `varying vec3 vTreePosition; varying float vTreeMask;
        uniform vec2 uPlayer; uniform vec3 uCamera, uViewRay;
        uniform float uPlayerHeight, uParallel;\n`
        : "") +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphatest_fragment>",
      `
      #include <alphatest_fragment>
      // A stable ordered pattern fades only trees crossing the camera/player
      // segment. The same shader on the cream hull prevents a ghost outline.
      vec2 cell=mod(floor(gl_FragCoord.xy),4.0);
      float threshold=fract(dot(cell,vec2(.25,.5625))+.03125);
      float obstructionFade=vOcclusion*uObstructionFade;
      ${
        clearTraveler
          ? `
        // Resolve the whole traveler's silhouette per fragment. Large curved
        // crown triangles cannot reliably interpolate the old vertex-only fade.
        vec3 treePlayer=vec3(uPlayer.x,uPlayerHeight,uPlayer.y);
        vec3 treeRay=normalize(mix(uCamera-treePlayer,uViewRay,uParallel));
        vec3 treeUp=normalize(vec3(0.0,1.0,0.0)-treeRay*treeRay.y);
        vec3 treeRight=normalize(cross(treeUp,treeRay));
        vec3 relative=vTreePosition-treePlayer;
        float vertical=dot(relative,treeUp);
        // The approved hat leans toward the viewer, extending its projected
        // height beyond its world-space Y extent.
        vec2 gap=vec2(dot(relative,treeRight),vertical-clamp(vertical,-.40,1.20));
        float clearance=vTreeMask*(1.0-smoothstep(.48,.86,length(gap)))
          *smoothstep(.025,.16,dot(relative,treeRay));
        obstructionFade=max(obstructionFade,clearance*.99);
      `
          : ""
      }
      if(threshold<obstructionFade) discard;
    `,
    );
    if (revival)
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
      #include <color_fragment>
      float alive=step(.001,uRevivalRadius)*(1.0-smoothstep(uRevivalRadius-2.0,uRevivalRadius+4.0,vForestDistance));
      float pigment=dot(diffuseColor.rgb,vec3(.299,.587,.114));
      vec3 dormant=vec3(pigment)*vec3(.94,1.0,.97);
      diffuseColor.rgb=mix(dormant,diffuseColor.rgb,${dormantSaturation.toFixed(3)}+${(1 - dormantSaturation).toFixed(3)}*alive);
    `,
      );
  };
  material.customProgramCacheKey = () =>
    `the-danny-painted-wind-v5-${revival}-${dormantSaturation}-${clearTraveler}`;
  return material;
}
export function windMaterial(map?: Texture) {
  return applyWindShader(
    new MeshStandardMaterial({
      color: "#ffffff",
      map: map ?? null,
      roughness: 1,
      flatShading: false,
      side: DoubleSide,
    }),
  );
}
