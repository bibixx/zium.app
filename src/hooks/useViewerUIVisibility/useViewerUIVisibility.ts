import { createContext, useContext, useEffect } from "react";
import { useStateWithRef } from "../useStateWithRef/useStateWithRef";

const UI_VISIBILITY_TIMEOUT = 1_000;

export const GLOBAL_UI_VISIBILITY_CLASS_NAME = "uiVisible";

interface ViewerUIVisibilityContextState {
  isUIVisible: boolean;
}
export const useViewerUIVisibilityState = (): ViewerUIVisibilityContextState => {
  const [isUIVisible, isUIVisibleRef, setIsUIVisible] = useStateWithRef(true);

  useEffect(() => {
    let timeout = -1;

    const onAction = () => {
      if (!isUIVisibleRef.current) {
        setIsUIVisible(true);
      }

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setIsUIVisible(false);
      }, UI_VISIBILITY_TIMEOUT);
    };

    document.addEventListener("mousemove", onAction, { capture: true, passive: true });
    document.addEventListener("keydown", onAction, { capture: true, passive: true });
    document.addEventListener("keyup", onAction, { capture: true, passive: true });
    onAction();

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", onAction);
      document.removeEventListener("keydown", onAction);
      document.removeEventListener("keyup", onAction);
    };
  }, [isUIVisibleRef, setIsUIVisible]);

  return { isUIVisible };
};

export const ViewerUIVisibilityContext = createContext<ViewerUIVisibilityContextState | null>(null);

export const useViewerUIVisibility = (): ViewerUIVisibilityContextState => {
  const context = useContext(ViewerUIVisibilityContext);

  if (context === null) {
    throw new Error("Using uninitialised ViewerUIVisibilityContext");
  }

  return context;
};
