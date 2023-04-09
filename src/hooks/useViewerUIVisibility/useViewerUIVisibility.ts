import { createContext, useContext, useEffect } from "react";
import { useStateWithRef } from "../useStateWithRef/useStateWithRef";

const UI_VISIBILITY_TIMEOUT = 5_000;

export const GLOBAL_UI_VISIBILITY_CLASS_NAME = "uiVisible";

interface ViewerUIVisibilityContextState {
  isUIVisible: boolean;
}
export const useViewerUIVisibilityState = (): ViewerUIVisibilityContextState => {
  const [isUIVisible, isUIVisibleRef, setIsUIVisible] = useStateWithRef(true);

  useEffect(() => {
    let timeout = -1;

    const onMouseMove = () => {
      if (!isUIVisibleRef.current) {
        setIsUIVisible(true);
      }

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setIsUIVisible(false);
      }, UI_VISIBILITY_TIMEOUT);
    };

    document.addEventListener("mousemove", onMouseMove);
    onMouseMove();

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", onMouseMove);
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
