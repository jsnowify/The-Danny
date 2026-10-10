export const waterVertex = `varying vec3 vWater; uniform float uTime;
#include <fog_pars_vertex>
void main(){
  vWater=position;vec3 p=position;
  p.z+=sin(p.x*1.3+uTime*.4)*cos(p.y*.8+uTime*.23)*.009;
  vec4 mvPosition=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;
export const waterFragment = `varying vec3 vWater; uniform float uTime; uniform vec2 uRipple; uniform sampler2D uPaper;
#include <fog_pars_fragment>
void main(){
  float stroke=sin(vWater.y*2.3+sin(vWater.x*.6)*.8+uTime*.12);
  float wash=sin(vWater.x*.42+vWater.y*.18)*cos(vWater.y*.5);
  float rings=sin(length(vWater.xy-uRipple)*8.0-uTime*1.6)*exp(-length(vWater.xy-uRipple)*.7);
  vec3 color=mix(vec3(.32,.47,.46),vec3(.60,.69,.61),.5+wash*.16+stroke*.055);
  color*=.94+.06*texture2D(uPaper,vWater.xy*.13).r;
  color+=smoothstep(.8,1.0,stroke)*.035+rings*.012;
  gl_FragColor=vec4(color,.96);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`;
