import { CanvasTexture, SRGBColorSpace } from "three";

/** Original painted artwork, with sunlight, midground and cool shade variants. */
export function forestCanopies(image: CanvasImageSource) {
  return ["emerald", "sunlit", "fern", "teal"].map((name, variant) => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 864;
    const c = canvas.getContext("2d")!;
    c.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = c.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const red = pixels.data[i],
        green = pixels.data[i + 1],
        blue = pixels.data[i + 2];
      // Preserve the actual leaf brushwork and alpha; shade stays chromatic.
      if (variant === 0) {
        pixels.data[i] = red * 0.76;
        pixels.data[i + 1] = green * 0.91;
        pixels.data[i + 2] = blue * 1.08;
      } else if (variant === 2) {
        pixels.data[i] = red * 0.88;
        pixels.data[i + 1] = green * 0.97;
        pixels.data[i + 2] = blue * 0.94;
      } else if (variant === 3) {
        pixels.data[i] = red * 0.47 + blue * 0.13;
        pixels.data[i + 1] = green * 0.78;
        pixels.data[i + 2] = blue * 1.12 + green * 0.1;
      }
    }
    c.putImageData(pixels, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.name = `painted-summer-canopy-${name}`;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  });
}
