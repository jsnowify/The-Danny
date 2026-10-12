import {
  CanvasTexture,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { random } from "../utils/random";
import { meadowPigment } from "./meadowPigment";
import { forestShade, forestShadeGLSL } from "./forestShade";
import { COMPOSITION } from "../config";
import { preparedImage } from "../textures/preparedArt";

/** Warm meadow light, cool leaf shadows and a winding sandy footpath. */
function drawLandscape() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2048;
  const c = canvas.getContext("2d")!,
    r = random(8641),
    side = 2048;
  c.fillStyle = "#93c25e";
  c.fillRect(0, 0, side, side);
  const wrapped = (draw: () => void) => {
    for (const x of [-side, 0, side])
      for (const y of [-side, 0, side]) {
        c.save();
        c.translate(x, y);
        draw();
        c.restore();
      }
  };
  for (let i = 0; i < 48; i++) {
    const x = r() * side,
      y = r() * side,
      radius = 120 + r() * 460;
    wrapped(() => {
      const wash = c.createRadialGradient(x, y, 0, x, y, radius);
      wash.addColorStop(
        0,
        i % 3 ? "rgba(212,234,131,.14)" : "rgba(44,125,88,.20)",
      );
      wash.addColorStop(1, "rgba(147,194,94,0)");
      c.fillStyle = wash;
      c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }
  meadowPigment(c, 8642, true);
  return canvas;
}

export function landscapePaint(approved: MeshStandardMaterial) {
  const canvas = preparedImage("landscape") ?? drawLandscape();
  const map = new CanvasTexture(canvas);
  map.name = "painted-summer-forest-floor";
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.anisotropy = 4;
  const material = approved.clone();
  material.name = "sunlit-grass-sand-and-canopy-shade";
  material.toneMapped = false;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, forestShade, { uLandscape: { value: map } });
    shader.vertexShader = "varying vec2 vGroundWorld;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvGroundWorld=(modelMatrix*vec4(position,1.0)).xz;",
    );
    shader.fragmentShader =
      "varying vec2 vGroundWorld; uniform sampler2D uLandscape;\n" +
      forestShadeGLSL +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #include <map_fragment>
      float outside=smoothstep(14.0,22.0,max(abs(vGroundWorld.x-.35),abs(vGroundWorld.y-1.6)));
      vec3 painted=texture2D(uLandscape,vec2(vGroundWorld.x,-vGroundWorld.y)/48.0).rgb;
      vec3 grass=mix(diffuseColor.rgb,painted,outside);
      float shade=forestShadow(vGroundWorld);
      float broad=leafNoise(vGroundWorld*.20);
      grass*=.95+.10*broad;
      vec3 shaded=grass*vec3(.28,.65,.70)+vec3(.018,.048,.038);
      grass=mix(grass,shaded,shade*.45);
      // The path uses the same curve as tree and grass placement. Its broken
      // pigment edge is world-fixed and stays on the terrain, including slopes.
      float pathCenter=sin(vGroundWorld.y*.063)*9.0;
      float edge=(leafNoise(vGroundWorld*2.6)-.5)*.20;
      float path=1.0-smoothstep(${(COMPOSITION.pathHalfWidth - 0.22).toFixed(3)},${(COMPOSITION.pathHalfWidth + 0.25).toFixed(3)},abs(vGroundWorld.x-pathCenter)+edge);
      path*=smoothstep(1.35,3.5,length(vGroundWorld));
      float sandGrain=leafNoise(vGroundWorld*19.0);
      vec3 sand=mix(vec3(.66,.60,.38),vec3(.82,.77,.57),sandGrain*.28+.62);
      sand=mix(sand,sand*vec3(.44,.70,.69),shade*.40);
      diffuseColor.rgb=mix(grass,sand,path);
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\ntotalEmissiveRadiance=diffuseColor.rgb*.025;",
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      "outgoingLight=mix(outgoingLight,diffuseColor.rgb,.10);\n#include <opaque_fragment>",
    );
  };
  material.customProgramCacheKey = () => "the-danny-summer-forest-floor-v8-lit";
  return {
    material,
    map,
    dispose() {
      material.dispose();
      map.dispose();
    },
  };
}
