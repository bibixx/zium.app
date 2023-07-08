import { MutableRefObject, useEffect } from "react";

export const useElementHeight = (
  onHeightChange: (height: number) => void,
  ref: MutableRefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const $element = ref.current;

    if ($element == null) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const [borderBoxSize] = entry.borderBoxSize;
      onHeightChange(borderBoxSize.blockSize);
    });

    resizeObserver.observe($element);

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
};
