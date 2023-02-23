import { useEffect, useState } from "react";

export const usePressedModifiers = () => {
  const [state, setState] = useState<{ meta: boolean; shift: boolean }>({ meta: false, shift: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent | MouseEvent) => {
      setState({ meta: e.metaKey, shift: e.shiftKey });
    };

    document.addEventListener("keydown", onKey, { capture: true });
    document.addEventListener("keyup", onKey, { capture: true });
    document.addEventListener("mouseup", onKey, { capture: true });
    document.addEventListener("mousedown", onKey, { capture: true });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      document.removeEventListener("mouseup", onKey);
      document.removeEventListener("mousedown", onKey);
    };
  }, []);

  return state;
};
