import {
  DoubleSide,
  InstancedBufferAttribute,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { random } from "../utils/random";
import { paintedLeaf } from "../scene/paintedGeometry";

export const GOLDEN_BUDGET = {
  high: { petals: 3200, leaves: 240, butterflies: 14, fireflies: 18, birds: 6 },
  medium: {
    petals: 1700,
    leaves: 120,
    butterflies: 9,
    fireflies: 12,
    birds: 4,
  },
  low: { petals: 650, leaves: 48, butterflies: 4, fireflies: 6, birds: 2 },
};

export function goldenCurrent(leaf: boolean, capacity: number) {
  const geometry = paintedLeaf();
  // Petals are asymmetric and curled; leaves have the longer pointed silhouette.
  const p = geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    p.setXYZ(i, x * (leaf ? 0.75 : 1.25), y * (leaf ? 1 : 0.6), x * x * 0.25);
  }
  geometry.computeVertexNormals();
  const r = random(leaf ? 7361 : 7360),
    seeds = new Float32Array(capacity * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = r();
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 4));
  const uniforms = {
    uTime: { value: 0 },
    uWind: { value: 0.6 },
    uWarmth: { value: 0 },
    uCenter: { value: new Vector2() },
    uPlayer: { value: new Vector2() },
    uRight: { value: new Vector3(1, 0, 0) },
    uUp: { value: new Vector3(0, 1, 0) },
    uLeaf: { value: leaf ? 1 : 0 },
    uMotion: { value: 1 },
  };
  const material = new ShaderMaterial({
    uniforms,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute vec4 aSeed;
      uniform float uTime,uWind,uWarmth,uLeaf,uMotion;
      uniform vec2 uCenter,uPlayer;
      uniform vec3 uRight,uUp;
      varying float vTint,vOpacity;
      void main(){
        float t=uTime*uMotion, seed=aSeed.x*6.28318;
        float current=t*(.07+aSeed.y*.08)*(0.6+uWind);
        float angle=seed+current+sin(t*.12+aSeed.z*17.0)*.38;
        float radius=3.1+aSeed.y*6.9+sin(t*.17+seed)*1.1+sin(angle*3.0+t*.11)*.5;
        vec2 flowing=vec2(cos(angle)*radius,sin(angle)*radius*.86);
        flowing+=vec2(sin(t*.23+seed*2.0),cos(t*.19+seed))*1.1;
        float stream=step(.74,aSeed.w);
        vec2 drift=uCenter+vec2((aSeed.x-.5)*30.0,(aSeed.y-.5)*24.0);
        drift+=vec2(sin(t*.17+seed)*1.7,cos(t*.13+seed)*1.4);
        vec2 center=mix(flowing,drift,stream);
        float fall=fract(aSeed.z-t*(.014+aSeed.y*.022));
        float terrain=sin(center.x*.075)*cos(center.y*.07)*.32+sin(center.y*.15)*.12;
        terrain-=.56*(1.0-smoothstep(5.15,6.4,distance(center,vec2(19.0,5.0))));
        float height=terrain+.07+pow(fall,2.5)*3.6;
        height+=sin(t*.7+seed)*.12+pow(max(0.0,sin(t*.13+seed)),6.0)*.9;
        float flutter=t*(.7+aSeed.z)+seed;
        vec2 shape=position.xy;
        shape=mat2(cos(flutter),-sin(flutter),sin(flutter),cos(flutter))*shape;
        shape.x*=.35+.65*abs(sin(flutter*.67+seed));
        float size=mix(.08,.16,aSeed.w)*(1.0+uLeaf*.42);
        vec3 world=vec3(center.x,height,center.y)+size*(uRight*shape.x+uUp*shape.y);
        vOpacity=mix(.58,.82,uWarmth)*mix(.25,1.0,smoothstep(.5,1.6,distance(center,uPlayer)));
        vTint=aSeed.y;
        gl_Position=projectionMatrix*viewMatrix*vec4(world,1.0);
      }`,
    fragmentShader: `
      varying float vTint,vOpacity;
      uniform float uWarmth,uLeaf;
      void main(){
        vec3 gold=mix(vec3(.79,.51,.12),vec3(1.0,.82,.30),vTint);
        gold=mix(gold,vec3(1.0,.95,.65),smoothstep(.91,1.0,vTint));
        gold=mix(gold,vec3(.73,.64,.24),uLeaf*.35);
        gl_FragColor=vec4(gold,vOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return { geometry, material, uniforms };
}
