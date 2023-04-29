import { useState, RefCallback, useCallback, useMemo } from "react";

export const usePopperAnchorRef = <T>(initialValue: T) => {
  const [element, setElement] = useState<T>(initialValue);

  const updateRef: RefCallback<T> = useCallback((ref: T) => {
    setElement(ref);
  }, []);

  const ref = useMemo(
    () => ({
      current: element,
    }),
    [element],
  );

  return { updateRef, ref, element };
};
