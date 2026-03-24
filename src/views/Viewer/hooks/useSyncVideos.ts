import { MutableRefObject, useEffect } from "react";
import { PlaybackOffsets } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow, MainGridWindow } from "../../../types/GridWindow";
import { UserOffsets, useUserOffsets } from "../../../hooks/useUserOffests/useUserOffests";
import { VideoPlayerRef } from "../../../components/VideoPlayer/VideoPlayer.types";

interface UseSyncVideosArguments {
  windows: GridWindow[];
  windowPlayerRefMapRef: MutableRefObject<Record<string, VideoPlayerRef | null>>;
  isLive: boolean;
  playbackOffsets: PlaybackOffsets;
}
export const useSyncVideos = ({ windows, windowPlayerRefMapRef, isLive, playbackOffsets }: UseSyncVideosArguments) => {
  const { offsets: userOffsetsRef, offsetEmitter } = useUserOffsets();

  useEffect(() => {
    const syncVideos = (forceSync = false) => {
      const mainWindow = windows.find((w) => w.type === "main");

      if (mainWindow == null || mainWindow.type !== "main") {
        return;
      }

      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];

      if (mainRef == null) {
        return;
      }

      const mainVideo = mainRef.video;
      const mainPlayer = mainRef.player;

      windows.forEach((w) => {
        if (w.id === mainWindow.id) {
          return;
        }

        const playerRef = windowPlayerRefMapRef.current[w.id];

        if (playerRef == null) {
          return;
        }

        const { video, player } = playerRef;

        const f1TVPlaceholderWindowWindow: GridWindow = {
          type: "main",
          id: "",
          streamId: "f1live",
        };
        const mainWindowToF1TVOffset = getOffset(
          playbackOffsets,
          userOffsetsRef.current,
          f1TVPlaceholderWindowWindow,
          mainWindow,
        );
        const offset = getOffset(playbackOffsets, userOffsetsRef.current, w, mainWindow, mainWindowToF1TVOffset);

        const isMainPlaying = !mainVideo.paused && !mainVideo.ended;
        const isPlaying = !video.paused && !video.ended;

        if (isPlaying !== isMainPlaying) {
          if (!isMainPlaying) {
            video.pause();
          } else {
            video.play().catch(() => {});
          }
        }

        if (isLive) {
          const mainTimeShift = mainPlayer.seekRange().end - mainVideo.currentTime;
          const playerTimeShift = player.seekRange().end - video.currentTime;
          const diff = Math.abs(playerTimeShift + offset - mainTimeShift);

          if (diff < 1 && !forceSync) {
            return;
          }

          video.currentTime = player.seekRange().end - (mainTimeShift + offset);
          return;
        }

        const targetTime = mainVideo.currentTime - offset;
        const diff = Math.abs(video.currentTime - targetTime);

        if (!forceSync) {
          if (diff < 1 || targetTime < 0) {
            return;
          }
        }

        video.currentTime = targetTime;
      });
    };

    let cleanupFunction: (() => void) | null = null;
    const setupPlayerListeners = () => {
      const mainWindow = windows.find((w) => w.type === "main");

      if (mainWindow == null) {
        return;
      }

      const mainRef = windowPlayerRefMapRef.current[mainWindow.id];

      if (mainRef == null) {
        return;
      }

      const mainVideo = mainRef.video;

      const forceSync = () => syncVideos(true);
      mainVideo.addEventListener("seeking", forceSync);
      offsetEmitter.addEventListener("change", forceSync);

      cleanupFunction = () => {
        mainVideo.removeEventListener("seeking", forceSync);
        offsetEmitter.removeEventListener("change", forceSync);
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
  }, [isLive, offsetEmitter, playbackOffsets, userOffsetsRef, windowPlayerRefMapRef, windows]);
};

const getOffset = (
  playbackOffsets: PlaybackOffsets,
  userOffsets: UserOffsets | null,
  w: GridWindow,
  mainWindow: MainGridWindow,
  additionalOffset = 0,
): number => {
  let userOffset = 0;
  if (w.type === "driver") {
    userOffset = userOffsets?.additionalStreams[w.driverId] ?? 0;
  } else if (w.type === "main") {
    userOffset = userOffsets?.additionalStreams[mainWindow.streamId] ?? 0;
  } else {
    userOffset = userOffsets?.additionalStreams[w.type] ?? 0;
  }

  let f1Offset = 0;
  if (w.type === "main") {
    f1Offset = playbackOffsets.f1[w.streamId]?.[mainWindow.streamId] ?? 0;
  } else {
    f1Offset = playbackOffsets.f1[w.type]?.[mainWindow.streamId] ?? 0;
  }

  return f1Offset + userOffset + additionalOffset;
};
