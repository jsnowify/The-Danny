import { CanvasTexture, Vector2, type Texture } from "three";
import type { WorldData } from "../scene/world";
import { random } from "../utils/random";
import { preparedImage } from "../textures/preparedArt";

export const forestShade = {
  uWoodlandShade: { value: null as Texture | null },
  uHomeTrees: { value: [new Vector2(), new Vector2()] },
};

/** Subtle forest pigment supplements the moving light's real cast shadows. */
export function woodlandShade(world: WorldData) {
  const prepared = !world.calibrated && preparedImage("woodland-shade");
  if (prepared) {
    const texture = new CanvasTexture(prepared);
    texture.name = "world-anchored-canopy-shade";
    return texture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const c = canvas.getContext("2d")!,
    r = random(82192),
    scale = 1024 / 220;
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, 1024, 1024);
  for (const chunk of world.chunks)
    for (const [kind, items] of Object.entries(chunk.items)) {
      if (
        ![
          "trunk",
          "narra",
          "acacia",
          "mango",
          "balete",
          "talisay",
          "agoho",
        ].includes(kind)
      )
        continue;
      for (const item of items!) {
        const radius =
          (kind === "trunk" ? item.sy * 0.7 : item.sx * 1.8) * scale;
        const x = (item.x - 1.7 + 110) * scale,
          y = (110 - item.z + 1.8) * scale;
        for (let i = 0; i < 12; i++) {
          const angle = r() * Math.PI * 2,
            spread = Math.sqrt(r()) * radius;
          const px = x + Math.cos(angle) * spread,
            py = y + Math.sin(angle) * spread * 0.68;
          const size = radius * (0.24 + r() * 0.28);
          c.save();
          c.translate(px, py);
          c.scale(1, 0.75);
          const wash = c.createRadialGradient(0, 0, size * 0.22, 0, 0, size);
          wash.addColorStop(0, "rgba(0,0,0,.25)");
          wash.addColorStop(0.7, "rgba(0,0,0,.17)");
          wash.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = wash;
          c.fillRect(-size, -size, 2 * size, 2 * size);
          c.restore();
        }
      }
    }
  const texture = new CanvasTexture(canvas);
  texture.name = "world-anchored-canopy-shade";
  return texture;
}

/** Shared by the floor and grass, so planted blades inherit the same shade. */
export const forestShadeGLSL = `
uniform sampler2D uWoodlandShade;
uniform vec2 uHomeTrees[2];
float leafHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float leafNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(leafHash(i),leafHash(i+vec2(1.0,0.0)),f.x),mix(leafHash(i+vec2(0.0,1.0)),leafHash(i+vec2(1.0,1.0)),f.x),f.y);
}
float forestShadow(vec2 world) {
  float shade=1.0-texture2D(uWoodlandShade,world/220.0+.5).r;
  // Deep leafy banks frame sunlit openings. Their pigment stays anchored to
  // the same winding route as the real trees and ground painting.
  float bank=world.x-sin(world.y*.063)*9.0;
  float coolBank=smoothstep(3.0,8.5,abs(bank))*mix(.62,.24,smoothstep(-2.0,3.0,bank));
  shade=max(shade,coolBank*(.78+.22*leafNoise(world*.65)));
  for(int i=0;i<2;i++) {
    vec2 delta=(world-uHomeTrees[i]+vec2(1.6,1.8))/vec2(3.3,2.7);
    float canopy=1.0-smoothstep(.45,1.25,length(delta)+(leafNoise(world*1.8)-.5)*.22);
    shade=max(shade,canopy*(.70+.16*leafNoise(world*3.2)));
  }
  return clamp(shade*(.78+.22*smoothstep(.2,.65,leafNoise(world*4.0))),0.0,.82);
}
`;
