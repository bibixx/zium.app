import { PlayerAPI, TimeMode } from "bitmovin-player";
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
      const baseTime = getBaseTime(playbackOffsets);

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

        const offset = getOffset(playbackOffsets, baseTime, w, mainWindow);
        const targetTime = mainWindowPlayer.getCurrentTime(TimeMode.AbsoluteTime) - offset;
        const diff = Math.abs(player.getCurrentTime(TimeMode.AbsoluteTime) - targetTime);

        if (diff < 1 && !forceSync) {
          return;
        }

        if (isLive) {
          player.timeShift(-diff);
        } else {
          player.seek(targetTime);
        }
      });
    };

    const interval = window.setInterval(
      () => {
        syncVideos();
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
    };
  }, [isLive, playbackOffsets, windowVideojsRefMapRef, windows]);
};

const getOffset = (
  playbackOffsets: PlaybackOffsets,
  baseTime: number | undefined,
  w: GridWindow,
  mainWindow: GridWindow,
): number => {
  // TODO: Figure out MultiViewer non-driver streams
  if (playbackOffsets.multiViewer === undefined || w.type !== "driver") {
    return playbackOffsets.f1[w.type]?.[mainWindow.type] ?? 0;
  }

  if (baseTime === undefined) {
    return 0;
  }

  const playbackOffset = playbackOffsets.multiViewer.find(
    (offset) => offset.type === "driver" && offset.driverId === w.driverId,
  );

  const playbackOffsetTime = playbackOffset?.time;

  if (playbackOffsetTime === undefined) {
    return 0;
  }

  return baseTime - playbackOffsetTime;
};

const getBaseTime = (playbackOffsets: PlaybackOffsets): number | undefined => {
  if (playbackOffsets.multiViewer === undefined) {
    return undefined;
  }

  return playbackOffsets.multiViewer.find(({ type }) => type === "main")?.time;
};
