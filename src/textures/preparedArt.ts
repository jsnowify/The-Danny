const names = [
  "ground",
  "landscape",
  "woodland-shade",
  "character-danny",
  "character-oscar",
  "animal-snowa",
  "animal-hoshi",
  "animal-thoma",
  "animal-simba",
  "animal-star",
  "animal-nano",
  "animal-doreamon",
  "animal-max",
] as const;
const images = new Map<string, HTMLImageElement>();
let preparation: Promise<void> | undefined;

export const preparedImage = (name: string) => images.get(name);

/** Decode the original painted assets once per session, outside React render. */
export function preparePaintedArt() {
  return (preparation ??= Promise.all(
    names.map(
      (name) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          let settled = false;
          image.decoding = "async";
          const finish = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            image.onload = image.onerror = null;
            resolve();
          };
          const timeout = window.setTimeout(() => {
            image.src = "";
            finish();
          }, 8000);
          image.onerror = finish;
          image.onload = () => {
            image.decode().then(() => {
              if (!settled && image.naturalWidth) images.set(name, image);
              finish();
            }, finish);
          };
          // Failed downloads retain the existing procedural painting as a fallback.
          image.src = `/art/forest/prepared/${name}.webp`;
        }),
    ),
  ).then(() => undefined));
}
