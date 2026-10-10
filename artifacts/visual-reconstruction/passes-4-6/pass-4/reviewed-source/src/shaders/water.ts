export const waterVertex = `varying vec3 vWater; uniform float uTime;
void main(){vWater=position;vec3 p=position;p.z += sin(p.x*2.0+uTime)*cos(p.y*1.6+uTime*.7)*.028;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
export const waterFragment = `varying vec3 vWater; uniform float uTime; uniform vec2 uRipple;
void main(){ float wave=sin(vWater.x*3.0+sin(vWater.y*2.0)+uTime*.6)*sin(vWater.y*4.0-uTime*.5);
float rings=sin(length(vWater.xy-uRipple)*10.0-uTime*2.8)*exp(-length(vWater.xy-uRipple)*.5);
vec3 color=mix(vec3(.29,.54,.51),vec3(.61,.77,.65),wave*.25+.5);
color+=pow(max(wave,0.),12.)*.17+rings*.025; gl_FragColor=vec4(color,.91);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
