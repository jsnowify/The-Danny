import {
  CanvasTexture,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { random } from "../utils/random";

/** A stationary painted surface beyond the accepted 36-unit clearing artwork. */
export function landscapePaint(approved: MeshStandardMaterial) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2048;
  const c = canvas.getContext("2d")!;
  const r = random(8641),
    side = 2048;
  c.fillStyle = "#7b886b";
  c.fillRect(0, 0, side, side);
  // Wrapped brush marks keep repeating edges continuous without mirrored
  // streaks. The 72-unit painting is wider than a normal camera view.
  const wrapped = (draw: () => void) => {
    for (const x of [-side, 0, side])
      for (const y of [-side, 0, side]) {
        c.save();
        c.translate(x, y);
        draw();
        c.restore();
      }
  };
  for (let i = 0; i < 32; i++) {
    const x = r() * side,
      y = r() * side,
      radius = 180 + r() * 500;
    wrapped(() => {
      const wash = c.createRadialGradient(x, y, 0, x, y, radius);
      wash.addColorStop(
        0,
        i % 3 ? "rgba(202,194,139,.22)" : "rgba(55,83,68,.25)",
      );
      wash.addColorStop(1, "rgba(105,126,82,0)");
      c.fillStyle = wash;
      c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }
  c.lineCap = "round";
  // Broad, broken pigment fields first. Their direction changes gradually
  // across the painting; the surface does not resemble parallel lawn stripes.
  for (let i = 0; i < 110; i++) {
    const x = r() * side,
      y = r() * side,
      length = 150 + r() * 580,
      rise = Math.sin(x * 0.003 + y * 0.0015) * 65;
    c.lineWidth = 18 + r() * 75;
    c.strokeStyle = i % 3 ? "rgba(223,218,174,.035)" : "rgba(51,75,58,.028)";
    wrapped(() => {
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(
        x + length * 0.25,
        y - rise,
        x + length * 0.7,
        y + rise * 0.4,
        x + length,
        y - rise * 0.7,
      );
      c.stroke();
    });
  }
  for (let i = 0; i < 1700; i++) {
    const x = r() * side,
      y = r() * side,
      length = 40 + r() * 310,
      rise = Math.sin(x * 0.004 + y * 0.0015) * 30;
    c.lineWidth = 0.7 + r() * 8;
    c.strokeStyle = i % 3 ? "rgba(245,238,185,.034)" : "rgba(38,69,45,.025)";
    wrapped(() => {
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(
        x + length * 0.32,
        y - rise * 0.4,
        x + length * 0.72,
        y + rise * 0.25,
        x + length,
        y - rise,
      );
      c.stroke();
    });
  }
  // Sparse flowing pale ribbons provide larger-scale direction among the dry brush.
  for (let i = 0; i < 6; i++) {
    const x = r() * side,
      y = r() * side,
      length = 250 + r() * 480;
    c.lineWidth = 3 + r() * 6;
    c.strokeStyle = "rgba(234,231,186,.045)";
    wrapped(() => {
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(
        x + length * 0.18,
        y - 110,
        x + length * 0.7,
        y + 30,
        x + length,
        y - 100,
      );
      c.stroke();
    });
  }
  for (let i = 0; i < 1700; i++) {
    const x = r() * side,
      y = r() * side;
    const patch = Math.sin(x * 0.008) * Math.cos(y * 0.006);
    if (patch < -0.2 || r() < 0.23) continue;
    for (let blade = 0; blade < 3; blade++) {
      const bx = x + blade * 4,
        h = 3 + r() * 11;
      c.fillStyle =
        blade % 2 ? "rgba(211,217,174,.20)" : "rgba(239,234,197,.23)";
      wrapped(() => {
        c.beginPath();
        c.moveTo(bx, y);
        c.quadraticCurveTo(bx + 2, y - h * 0.6, bx + 5, y - h);
        c.quadraticCurveTo(bx + 4, y - h * 0.3, bx + 2, y);
        c.fill();
      });
    }
  }
  for (let i = 0; i < 65000; i++) {
    c.fillStyle = i % 2 ? "rgba(255,246,210,.04)" : "rgba(35,57,37,.035)";
    c.fillRect(r() * side, r() * side, 1, 0.6 + r());
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.anisotropy = 4;
  const material = approved.clone();
  material.name = "approved-clearing-and-painted-landscape";
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLandscape = { value: map };
    shader.vertexShader = "varying vec2 vGroundWorld;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvGroundWorld=(modelMatrix*vec4(position,1.0)).xz;",
    );
    shader.fragmentShader =
      "varying vec2 vGroundWorld; uniform sampler2D uLandscape;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #include <map_fragment>
      // The accepted clearing's pixels remain exact inside this envelope.
      float outside=smoothstep(14.0,22.0,max(abs(vGroundWorld.x-.35),abs(vGroundWorld.y-1.6)));
      vec3 painted=texture2D(uLandscape,vec2(vGroundWorld.x,-vGroundWorld.y)/72.0).rgb;
      // A stationary broad pigment field breaks the texture's repeat. It has
      // no relation to camera position or animation time.
      float field=.5+.5*sin(vGroundWorld.x*.049+sin(vGroundWorld.y*.036))*cos(vGroundWorld.y*.044);
      painted=mix(painted,vec3(.43,.49,.38),field*.07);
      float canopyShade=1.0-.08*smoothstep(20.0,48.0,length(vGroundWorld));
      diffuseColor.rgb=mix(diffuseColor.rgb,painted*canopyShade,outside);
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `
      #include <emissivemap_fragment>
      totalEmissiveRadiance=mix(totalEmissiveRadiance,emissive*painted,outside);
    `,
    );
  };
  material.customProgramCacheKey = () => "the-danny-fixed-painted-landscape-v2";
  return {
    material,
    map,
    dispose() {
      material.dispose();
      map.dispose();
    },
  };
}
