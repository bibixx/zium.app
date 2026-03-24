import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GridWindow } from "../../../types/GridWindow";
import { VideoPlayerRef } from "../../../components/VideoPlayer/VideoPlayer.types";

const STAGGER_DELAY_MS = 100;

interface StaggeredLoadState {
  readyWindowIds: Set<string>;
}

const DeferLoadContext = createContext(false);

export function useDeferLoad() {
  return useContext(DeferLoadContext);
}

interface DeferLoadGateProps {
  shouldDefer: boolean;
  children: ReactNode;
}

export function DeferLoadGate({ shouldDefer, children }: DeferLoadGateProps) {
  return <DeferLoadContext.Provider value={shouldDefer}>{children}</DeferLoadContext.Provider>;
}

export function useStaggeredLoad(windows: GridWindow[], mainVideoPlayer: VideoPlayerRef | null) {
  const [state, setState] = useState<StaggeredLoadState>(() => {
    const mainWindow = windows.find((w) => w.type === "main");
    return { readyWindowIds: new Set(mainWindow ? [mainWindow.id] : []) };
  });

  // Track window IDs separately so we only reset stagger when windows are
  // added/removed, not when a window's data changes (e.g. driver switch).
  const windowIds = useMemo(() => windows.map((w) => w.id).join(","), [windows]);
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  // Reset when the set of window IDs changes (add/remove)
  useEffect(() => {
    const currentWindows = windowsRef.current;
    const mainWindow = currentWindows.find((w) => w.type === "main");
    setState({ readyWindowIds: new Set(mainWindow ? [mainWindow.id] : []) });
  }, [windowIds]);

  // Once the main video player is ready, stagger-release the rest
  useEffect(() => {
    if (mainVideoPlayer == null) return;

    const currentWindows = windowsRef.current;
    const nonMainWindows = currentWindows.filter((w) => w.type !== "main");
    const timeouts: number[] = [];

    nonMainWindows.forEach((w, i) => {
      const timeout = window.setTimeout(
        () => {
          setState((prev) => {
            const next = new Set(prev.readyWindowIds);
            next.add(w.id);
            return { readyWindowIds: next };
          });
        },
        (i + 1) * STAGGER_DELAY_MS,
      );
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [mainVideoPlayer, windowIds]);

  const isWindowReady = useMemo(() => {
    const readyIds = state.readyWindowIds;
    return (id: string) => readyIds.has(id);
  }, [state.readyWindowIds]);

  return { isWindowReady };
}
