import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts/danny-dialogues", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 790 } });
  await page.goto("http://127.0.0.1:5174/");
  await page.evaluate(async () => {
    const { drawCharacter } = await import("/src/features/characters/paint.ts");
    document.querySelector("#root").style.display = "none";
    document.body.style.cssText =
      "margin:0;background:#e8ebd9;color:#314c3e;overflow:auto;";
    const board = document.createElement("canvas");
    board.width = 960;
    board.height = 790;
    const c = board.getContext("2d");
    c.fillStyle = "#e8ebd9";
    c.fillRect(0, 0, 960, 790);
    for (const [col, who] of ["danny", "oscar"].entries()) {
      c.fillStyle = "#314c3e";
      c.font = "25px serif";
      c.fillText(
        who === "danny"
          ? "Danny - white sando, navy hat"
          : "Oscar - Philippine Army",
        col * 480 + 20,
        32,
      );
      c.font = "17px serif";
      c.fillText(
        who === "danny"
          ? "Shorts, flashlight and hammer"
          : "Same small ears and chibi proportions",
        col * 480 + 20,
        58,
      );
      for (const [row, view] of ["front", "side", "back"].entries())
        for (const [offset, pose] of ["idle", "walk", "sit"].entries()) {
          c.save();
          c.translate(col * 480 + offset * 158, row * 232 + 73);
          c.scale(1.45, 1.45);
          drawCharacter(c, who, pose, view, pose === "walk" ? 1 : 0);
          c.restore();
          c.fillStyle = "#314c3e";
          c.font = "16px serif";
          c.fillText(
            view + " / " + pose,
            col * 480 + offset * 158 + 32,
            row * 232 + 258,
          );
        }
    }
    document.body.append(board);
  });
  await page.screenshot({ path: "artifacts/danny-dialogues/characters.png" });
} finally {
  await browser.close();
}
