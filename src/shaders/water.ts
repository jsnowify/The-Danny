export const waterVertex = `varying vec3 vWater; uniform float uTime;
#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
void main(){
  vWater=position;vec3 p=position;
  p.z+=sin(p.x*1.3+uTime*.4)*cos(p.y*.8+uTime*.23)*.009;
  vec4 mvPosition=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mvPosition;
  vec4 worldPosition=modelMatrix*vec4(p,1.0);
  vec3 transformedNormal=normalMatrix*vec3(0.0,0.0,1.0);
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`;
export const waterFragment = `varying vec3 vWater; uniform float uTime; uniform vec2 uRipple; uniform sampler2D uPaper;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main(){
  float stroke=sin(vWater.y*2.3+sin(vWater.x*.6)*.8+uTime*.12);
  float wash=sin(vWater.x*.42+vWater.y*.18)*cos(vWater.y*.5);
  float rings=sin(length(vWater.xy-uRipple)*8.0-uTime*1.6)*exp(-length(vWater.xy-uRipple)*.7);
  vec3 color=mix(vec3(.055,.19,.17),vec3(.21,.43,.34),.5+wash*.20+stroke*.055);
  color*=.94+.06*texture2D(uPaper,vWater.xy*.13).r;
  float sunlight=getShadowMask();
  color=mix(color*vec3(.45,.72,.82),color,sunlight);
  color+=smoothstep(.93,1.0,stroke)*.04*sunlight+rings*.012;
  gl_FragColor=vec4(color,.96);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`;
