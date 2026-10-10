import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
console.log(
  await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return { supported: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      supported: true,
      renderer: ext
        ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
    };
  }),
);
await browser.close();
