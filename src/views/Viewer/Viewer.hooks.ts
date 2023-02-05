import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { VideoJsPlayer } from "video.js";
import { GridWindow } from "../../types/GridWindow";

interface UseSyncVideosArguments {
  windows: GridWindow[];
  windowVideojsRefMapRef: MutableRefObject<
    Record<string, VideoJsPlayer | null>
  >;
}
export const useSyncVideos = ({
  windows,
  windowVideojsRefMapRef,
}: UseSyncVideosArguments) => {
  useEffect(() => {
    const syncVideos = (forceSync = false) => {
      const mainWindow = windows.find((w) => w.type === "main");

      if (mainWindow == null) {
        return;
      }

      const mainWindowPlayer = windowVideojsRefMapRef.current[mainWindow.id];

      if (mainWindowPlayer == null || mainWindowPlayer.paused()) {
        return;
      }

      windows.forEach((w) => {
        if (w.id === mainWindow.id) {
          return;
        }

        const player = windowVideojsRefMapRef.current[w.id];

        if (player == null) {
          return;
        }

        const diff = Math.abs(
          player.currentTime() - mainWindowPlayer.currentTime(),
        );

        if (diff < 3 && !forceSync) {
          return;
        }

        player.currentTime(mainWindowPlayer.currentTime());
      });
    };

    const interval = window.setInterval(() => {
      syncVideos();
    }, 100);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncVideos(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [windowVideojsRefMapRef, windows]);
};

interface UseFocusedVideoArguments {
  windows: GridWindow[];
}
export const useVideoAudio = ({ windows }: UseFocusedVideoArguments) => {
  const mainWindow = useMemo(
    () => windows.find((w) => w.type === "main"),
    [windows],
  );

  const [volume, setVolume] = useState(1);
  const [wasOverwritten, setWasOverwritten] = useState(false);
  const [audioFocusedWindow, setFocusedWindow] = useState(
    mainWindow?.id ?? null,
  );

  useEffect(() => {
    if (wasOverwritten) {
      return;
    }

    const newMainWindow = windows.find((w) => w.type === "main");
    setFocusedWindow(newMainWindow?.id ?? null);
  }, [wasOverwritten, windows]);

  const onWindowAudioFocus = useCallback((id: string | null) => {
    setFocusedWindow(id);
    setWasOverwritten(true);
  }, []);

  return {
    onWindowAudioFocus,
    audioFocusedWindow,
    volume,
    setVolume,
  };
};
