import { useEffect, useState } from "react";
import { isWindows } from "../../../utils/platform";

export const usePressedModifiers = () => {
  const [state, setState] = useState<{ meta: boolean; shift: boolean }>({ meta: false, shift: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent | MouseEvent) => {
      const meta = isWindows ? e.ctrlKey : e.metaKey;

      setState({ meta, shift: e.shiftKey });
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
