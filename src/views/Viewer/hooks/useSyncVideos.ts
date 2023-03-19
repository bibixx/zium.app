import { PlayerAPI, TimeMode } from "bitmovin-player";
import { MutableRefObject, useEffect } from "react";
import { GridWindow } from "../../../types/GridWindow";

interface UseSyncVideosArguments {
  windows: GridWindow[];
  windowVideojsRefMapRef: MutableRefObject<Record<string, PlayerAPI | null>>;
  isDisabled: boolean;
}
export const useSyncVideos = ({ windows, windowVideojsRefMapRef, isDisabled }: UseSyncVideosArguments) => {
  useEffect(() => {
    if (isDisabled) {
      return;
    }

    const syncVideos = (forceSync = false) => {
      const mainWindow = windows.find((w) => w.type === "main");

      if (mainWindow == null) {
        return;
      }

      const mainWindowPlayer = windowVideojsRefMapRef.current[mainWindow.id];

      if (mainWindowPlayer == null) {
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
          player.getCurrentTime(TimeMode.AbsoluteTime) - mainWindowPlayer.getCurrentTime(TimeMode.AbsoluteTime),
        );

        if (diff < 3 && !forceSync) {
          return;
        }

        player.seek(mainWindowPlayer.getCurrentTime(TimeMode.AbsoluteTime));
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
  }, [isDisabled, windowVideojsRefMapRef, windows]);
};
