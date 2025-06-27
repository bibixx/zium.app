import { useEffect, useState } from "react";

const IMAGE_CACHE = new Map<string, boolean>();

export const useImage = (srcList: string[]) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const abortController = new AbortController();

    async function findAvailableImage() {
      for (const src of srcList) {
        if (isImageInCache(src)) {
          IMAGE_CACHE.set(src, true);
          return src;
        }

        if (IMAGE_CACHE.get(src) === false) {
          continue;
        }

        if (IMAGE_CACHE.get(src) === true) {
          return src;
        }

        const res = await fetch(src, { method: "HEAD", signal: abortController.signal });
        const wasSuccessful = res.status === 200;
        IMAGE_CACHE.set(src, wasSuccessful);

        if (!wasSuccessful) {
          continue;
        }

        return src;
      }
    }

    async function run() {
      try {
        const src = await findAvailableImage();
        setSrc(src);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    run();

    return () => {
      abortController.abort();
    };
  }, [srcList]);

  return src;
};

function isImageInCache(src: string | undefined | null) {
  if (!src) {
    return false;
  }

  const image = new Image();
  image.src = src;

  const inCache = image.complete;
  image.remove();

  return inCache;
}
