import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export const useImageLoadState = (src: string | undefined | null) => {
  const [loadingState, setIsLoaded] = useState<"loading" | "loaded" | "error">(() =>
    isImageInCache(src) ? "loaded" : "loading",
  );
  const prevSrc = useRef(src);

  useEffect(
    function onSrcUpdate() {
      if (src !== prevSrc.current) {
        setIsLoaded(isImageInCache(src) ? "loaded" : "loading");
      }

      prevSrc.current = src;
    },
    [src],
  );

  const onLoad = useCallback(() => {
    if (src) {
      setIsLoaded("loaded");
    }
  }, [src]);

  const onError = useCallback(() => {
    if (src) {
      setIsLoaded("error");
    }
  }, [src]);

  const imgProps = useMemo(
    () => ({
      onLoad,
      onError,
    }),
    [onError, onLoad],
  );

  return { loadingState, imgProps };
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
