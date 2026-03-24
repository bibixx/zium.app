import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
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

  // Reset when windows change — main is always ready immediately
  useEffect(() => {
    const mainWindow = windows.find((w) => w.type === "main");
    setState({ readyWindowIds: new Set(mainWindow ? [mainWindow.id] : []) });
  }, [windows]);

  // Once the main video player is ready, stagger-release the rest
  useEffect(() => {
    if (mainVideoPlayer == null) return;

    const nonMainWindows = windows.filter((w) => w.type !== "main");
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
  }, [mainVideoPlayer, windows]);

  const isWindowReady = useMemo(() => {
    const readyIds = state.readyWindowIds;
    return (id: string) => readyIds.has(id);
  }, [state.readyWindowIds]);

  return { isWindowReady };
}
