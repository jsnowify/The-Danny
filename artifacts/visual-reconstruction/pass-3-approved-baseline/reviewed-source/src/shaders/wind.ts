import {
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshDepthMaterial,
  Vector2,
  Vector3,
  type Texture,
} from "three";
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
};

export function applyWindShader(
  material: MeshStandardMaterial | MeshBasicMaterial | MeshDepthMaterial,
  revival = true,
  dormantSaturation = 0.18,
  clearTraveler = false,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, windUniforms);
    shader.vertexShader =
      `
      uniform float uTime, uWind, uPlayerHeight;
      uniform vec2 uPlayer; uniform vec3 uCamera, uViewRay; uniform float uParallel;
      attribute float aFlex, aGrass, aCanopy;
      varying float vOcclusion, vForestDistance;
      ${clearTraveler ? "varying vec3 vTreePosition; varying float vTreeMask;" : ""}
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
      float sway=sin(uTime*1.15+base.x*.35+base.z*.24);
      transformed.x+=sway*aFlex*uWind*.18;
      transformed.z+=cos(uTime*.9+base.x*.2)*aFlex*uWind*.1;
      float wake=(1.0-smoothstep(.2,2.5,distanceToPlayer))*aGrass;
      transformed.x+=sin(base.x*7.0+uTime*3.0)*wake*.2;
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
    `the-danny-painted-wind-v4-${revival}-${dormantSaturation}-${clearTraveler}`;
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
