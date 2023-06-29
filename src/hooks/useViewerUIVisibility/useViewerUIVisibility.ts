import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useFeatureFlags } from "../useFeatureFlags/useFeatureFlags";
import { useStateWithRef } from "../useStateWithRef/useStateWithRef";

const UI_VISIBILITY_TIMEOUT = 1_000;

export const GLOBAL_UI_VISIBILITY_CLASS_NAME = "uiVisible";

interface ViewerUIVisibilityContextState {
  isUIVisible: boolean;
  preventHiding: (shouldPrevent: boolean) => void;
}
export const useViewerUIVisibilityState = (): ViewerUIVisibilityContextState => {
  const [isUIVisible, isUIVisibleRef, setIsUIVisible] = useStateWithRef(true);
  const { flags } = useFeatureFlags();
  const isDebugMode = flags.forceUiVisibility;
  const [shouldPreventHiding, setShouldPreventHiding] = useState(false);

  const preventHiding = useCallback(
    (shouldPrevent: boolean) => {
      if (shouldPrevent) {
        setShouldPreventHiding(true);
        setIsUIVisible(true);
      } else {
        setShouldPreventHiding(false);
      }
    },
    [setIsUIVisible],
  );

  useEffect(() => {
    if (shouldPreventHiding) {
      return;
    }

    let timeout: number | undefined = undefined;

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
      document.removeEventListener("mousemove", onAction, { capture: true });
      document.removeEventListener("keydown", onAction, { capture: true });
      document.removeEventListener("keyup", onAction, { capture: true });
      clearTimeout(timeout);
    };
  }, [isUIVisibleRef, setIsUIVisible, shouldPreventHiding]);

  if (isDebugMode) {
    return { isUIVisible: true, preventHiding };
  }

  return { isUIVisible, preventHiding };
};

export const ViewerUIVisibilityContext = createContext<ViewerUIVisibilityContextState | null>(null);

export const useViewerUIVisibility = (): ViewerUIVisibilityContextState => {
  const context = useContext(ViewerUIVisibilityContext);

  if (context === null) {
    throw new Error("Using uninitialised ViewerUIVisibilityContext");
  }

  return context;
};
