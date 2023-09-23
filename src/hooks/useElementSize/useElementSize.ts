import { MutableRefObject, useEffect } from "react";

export const useElementSize = (
  onSizeChange: (size: { height: number; width: number }) => void,
  ref: MutableRefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const $element = ref.current;

    if ($element == null) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const [borderBoxSize] = entry.borderBoxSize;
      onSizeChange({ height: borderBoxSize.blockSize, width: borderBoxSize.inlineSize });
    });

    resizeObserver.observe($element);

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
};
