import {
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshDepthMaterial,
  Vector2,
  type Texture,
} from "three";
import { breeze, breezeGLSL } from "../scene/breeze";
import { forestShade, forestShadeGLSL } from "../visual/forestShade";
import { treeContact } from "../features/forestLife/treeContact";
export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.6 },
  uPlayer: { value: new Vector2() },
  uPlayerDirection: { value: new Vector2(0, 1) },
  uBrushMotion: { value: 1 },
  uContactTime: { value: 0 },
  uPlayerHeight: { value: 0.8 },
  uRevivalRadius: { value: 0 },
  uWindDirection: { value: breeze.direction },
  uTrail: { value: breeze.trail },
  uTreeImpacts: { value: treeContact.marks },
};

export function applyWindShader<
  T extends MeshStandardMaterial | MeshBasicMaterial | MeshDepthMaterial,
>(material: T, revival = true, dormantSaturation = 0.18) {
  // Wind and contact move geometry. They never change a tree's opacity or
  // carve a player-shaped opening into leaves, branches or bark.
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, windUniforms);
    shader.vertexShader =
      `
      uniform float uTime, uWind, uPlayerHeight, uContactTime, uBrushMotion;
      uniform vec2 uPlayer, uWindDirection, uPlayerDirection; uniform vec4 uTrail[${breeze.trail.length}];
      uniform vec4 uTreeImpacts[8];
      attribute float aFlex, aGrass, aCanopy;
      varying float vForestDistance;
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
      vForestDistance=length(base.xz);
      float distanceToPlayer=distance(base.xz,uPlayer);
      float lod=1.0-smoothstep(18.0,32.0,distanceToPlayer);
      transformed*=mix(1.0,lod,aGrass);
      float weight=mix(aFlex,aFlex*aFlex,aGrass);
      // A damped, local impulse only follows an actual solid-trunk collision.
      // Grounded stems have zero flex at their roots; shadow geometry agrees.
      if (aGrass<.5 && uBrushMotion>.5) {
        for(int impact=0;impact<8;impact++) {
          float age=uContactTime-uTreeImpacts[impact].z;
          if(age>=0.0 && age<1.6 && distance(center.xz,uTreeImpacts[impact].xy)<.12)
            transformed.x+=sin(age*15.0)*exp(-age*4.0)*uTreeImpacts[impact].w*aFlex*.38;
        }
      }
      if (uWind>.001) {
      float flowing=breezeAt(center.xz,uTime);
      float flutter=sin(uTime*3.1+center.x*.73+center.z*.51)*.018;
      vec3 windAxis=vec3(uWindDirection.x,0.0,uWindDirection.y);
      #ifdef USE_INSTANCING
        windAxis=normalize(transpose(mat3(instanceMatrix))*windAxis);
      #endif
      // Quadratic grass weighting pins every root. Trees retain their small
      // authored flex: heavy stems barely move while outer foliage yields.
      // Nearby clumps share a travelling gust, while individual blades flutter
      // quietly. The old near-constant offset barely changed their silhouette.
      float meadowWave=(flowing-.48)*.5+sin(uTime*1.25-center.x*.21-center.z*.18)*.20+flutter*.65;
      float bend=mix(flowing*.13,meadowWave,aGrass)*uWind;
      transformed+=windAxis*weight*bend;
      transformed.y-=aGrass*weight*bend*bend*.18;
      }
      // Twelve stamps cover at most 5.4 units of the resolved walking trail.
      // Distant clumps skip the contact work entirely.
      if (length(center.xz-uPlayer)<7.0 && (aGrass>.5 || (aCanopy>.5 && base.y<uPlayerHeight+.5))) {
      vec2 bodyAway=center.xz-uPlayer;
      float bodyDistance=length(bodyAway);
      vec2 direction=bodyDistance>.025 ? bodyAway/bodyDistance : vec2(uPlayerDirection.y,-uPlayerDirection.x);
      // Live body contact still parts vegetation when reduced motion stops wind.
      vec2 disturbance=direction*(1.0-smoothstep(.10,1.0,bodyDistance))*.43;
      for(int mark=0;mark<${breeze.trail.length};mark++) {
        float age=max(0.0,uContactTime-uTrail[mark].z);
        vec2 away=center.xz-uTrail[mark].xy;
        float nearby=1.0-smoothstep(.10,1.0,length(away));
        float recovery=exp(-age*4.0)*(1.0-smoothstep(.85,1.2,age));
        vec2 wake=away/max(.025,length(away))*nearby*recovery*uTrail[mark].w*.43*uBrushMotion;
        // Overlapping footsteps cannot stack into an oversized bend.
        if(dot(wake,wake)>dot(disturbance,disturbance)) disturbance=wake;
      }
      vec3 brushing=vec3(disturbance.x,0.0,disturbance.y);
      #ifdef USE_INSTANCING
        vec3 scaleSquared=vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz));
        brushing=transpose(mat3(instanceMatrix))*brushing/max(scaleSquared,vec3(.001));
      #endif
      transformed+=brushing*weight*mix(.22,1.0,aGrass);
      transformed.y-=aGrass*weight*length(disturbance)*.32;
      }
    `,
    );
    shader.fragmentShader =
      `varying float vForestDistance; uniform float uRevivalRadius;\n` +
      shader.fragmentShader;
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
    `the-danny-painted-wind-v10-opaque-trees-${revival}-${dormantSaturation}`;
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

/** Matte blades share the floor's real sunlight and cool canopy shadows. */
export function grassMaterial() {
  const material = applyWindShader(
    new MeshStandardMaterial({
      color: "#ffffff",
      side: DoubleSide,
      toneMapped: false,
      roughness: 1,
      metalness: 0,
    }),
    true,
    0.96,
  );
  const compile = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    compile(shader, renderer);
    Object.assign(shader.uniforms, forestShade);
    shader.vertexShader =
      "varying vec2 vBladeUV, vGrassWorld;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vBladeUV=uv;
      vec4 grassPoint=vec4(position,1.0);
      #ifdef USE_INSTANCING
        grassPoint=instanceMatrix*grassPoint;
      #endif
      vGrassWorld=(modelMatrix*grassPoint).xz;`,
    );
    shader.fragmentShader =
      "varying vec2 vBladeUV, vGrassWorld;\n" +
      forestShadeGLSL +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      vec3 root=vec3(.055,.22,.12);
      float blade=smoothstep(0.0,.85,vBladeUV.y);
      float bladePigment=fract(sin(floor(vBladeUV.x)*13.71)*43758.5453);
      vec3 tip=diffuseColor.rgb*mix(vec3(.82,.95,.80),vec3(1.04,1.02,.91),bladePigment);
      diffuseColor.rgb=mix(root,tip,mix(.32,1.0,blade));
      float crease=smoothstep(.41,.47,fract(vBladeUV.x))*(1.0-smoothstep(.47,.52,fract(vBladeUV.x)));
      diffuseColor.rgb*=1.0+crease*.035;
      float shade=forestShadow(vGrassWorld);
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.32,.67,.73),shade*.45);
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      // Upright painted strokes gather sky light like a rounded grass tuft.
      normal=normalize(mix(normal,normalize(mat3(viewMatrix)*vec3(0.0,1.0,0.0)),.55));`,
    );
  };
  material.customProgramCacheKey = () =>
    "the-danny-sunlit-forest-grass-v6-lit-contact";
  return material;
}
