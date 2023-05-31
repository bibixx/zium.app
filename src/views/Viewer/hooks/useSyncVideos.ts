import { PlayerAPI, PlayerEvent, TimeMode } from "bitmovin-player";
import { MutableRefObject, useEffect } from "react";
import { PlaybackOffsets } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow } from "../../../types/GridWindow";

interface UseSyncVideosArguments {
  windows: GridWindow[];
  windowVideojsRefMapRef: MutableRefObject<Record<string, PlayerAPI | null>>;
  isLive: boolean;
  playbackOffsets: PlaybackOffsets;
}
export const useSyncVideos = ({ windows, windowVideojsRefMapRef, isLive, playbackOffsets }: UseSyncVideosArguments) => {
  useEffect(() => {
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

        const offset = getOffset(playbackOffsets, w, mainWindow);
        if (isLive) {
          const diff = Math.abs(player.getTimeShift() - -offset);

          if (diff < 1 && !forceSync) {
            return;
          }

          player.timeShift(-offset);
          return;
        }

        const targetTime = mainWindowPlayer.getCurrentTime(TimeMode.AbsoluteTime) - offset;
        const diff = Math.abs(player.getCurrentTime(TimeMode.AbsoluteTime) - targetTime);

        if (diff < 1 && !forceSync) {
          return;
        }

        player.seek(targetTime);
      });
    };

    let cleanupFunction: (() => void) | null = null;
    const setupPlayerListeners = () => {
      const mainWindow = windows.find((w) => w.type === "main");

      if (mainWindow == null) {
        return;
      }

      const mainWindowPlayer = windowVideojsRefMapRef.current[mainWindow.id];

      if (mainWindowPlayer == null) {
        return;
      }

      const forceSync = () => syncVideos(true);
      mainWindowPlayer.on(PlayerEvent.Seek, forceSync);
      mainWindowPlayer.on(PlayerEvent.TimeShift, forceSync);

      cleanupFunction = () => {
        mainWindowPlayer.off(PlayerEvent.Seek, forceSync);
        mainWindowPlayer.off(PlayerEvent.TimeShift, forceSync);
      };
    };

    const interval = window.setInterval(
      () => {
        syncVideos();

        if (cleanupFunction == null) {
          setupPlayerListeners();
        }
      },
      isLive ? 5_000 : 100,
    );

    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncVideos(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cleanupFunction?.();
    };
  }, [isLive, playbackOffsets, windowVideojsRefMapRef, windows]);
};

const getOffset = (playbackOffsets: PlaybackOffsets, w: GridWindow, mainWindow: GridWindow): number => {
  return playbackOffsets.f1[w.type]?.[mainWindow.type] ?? 0;
};
