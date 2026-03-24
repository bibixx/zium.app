import { useCallback } from "react";
import { VideoPlayerRef } from "../../../components/VideoPlayer/VideoPlayer.types";
import { toggleFullScreen } from "../../../utils/toggleFullScreen";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { useEasterEgg } from "../../../hooks/useEasterEgg/useEasterEgg";

export const useGlobalShortcuts = (
  playerRef: VideoPlayerRef | null,
  setAreVideosPaused: (fn: (oldValue: boolean) => boolean) => void,
  setIsMuted: (fn: (oldValue: boolean) => boolean) => void,
) => {
  useEasterEgg();

  const onPlayClick = useCallback(() => {
    if (document.activeElement != null && document.activeElement !== document.body) {
      return;
    }

    setAreVideosPaused((isPaused) => !isPaused);
  }, [setAreVideosPaused]);

  const onBigSkipAhead = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime += 30;
  }, [playerRef]);

  const onSmallSkipAhead = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime += 1;
  }, [playerRef]);

  const onSuperSmallSkipAhead = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime += 0.1;
  }, [playerRef]);

  const onBigSkipBackwards = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime -= 30;
  }, [playerRef]);

  const onSmallSkipBackwards = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime -= 1;
  }, [playerRef]);

  const onSuperSmallSkipBackwards = useCallback(() => {
    if (playerRef == null) return;
    playerRef.video.currentTime -= 0.1;
  }, [playerRef]);

  const onToggleFullScreen = useCallback(() => {
    toggleFullScreen();
  }, []);

  const onCloseFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      toggleFullScreen();
    }
  }, []);

  const onToggleMute = useCallback(() => {
    setIsMuted((isMuted) => !isMuted);
  }, [setIsMuted]);

  useHotkeys(
    () => ({
      id: "global",
      allowPropagation: true,
      hotkeys: [
        {
          keys: SHORTCUTS.PLAY_PAUSE,
          action: onPlayClick,
        },
        {
          keys: SHORTCUTS.BIG_SKIP_AHEAD,
          action: onBigSkipAhead,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.SMALL_SKIP_AHEAD,
          action: onSmallSkipAhead,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.SUPER_SMALL_SKIP_AHEAD,
          action: onSuperSmallSkipAhead,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.BIG_SKIP_BACKWARDS,
          action: onBigSkipBackwards,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.SMALL_SKIP_BACKWARDS,
          action: onSmallSkipBackwards,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.SUPER_SMALL_SKIP_BACKWARDS,
          action: onSuperSmallSkipBackwards,
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.CLOSE,
          action: onCloseFullScreen,
        },
        {
          keys: SHORTCUTS.TOGGLE_FULL_SCREEN,
          action: onToggleFullScreen,
        },
        {
          keys: SHORTCUTS.TOGGLE_MUTE,
          action: onToggleMute,
        },
      ],
    }),
    [
      onBigSkipAhead,
      onBigSkipBackwards,
      onCloseFullScreen,
      onPlayClick,
      onSmallSkipAhead,
      onSmallSkipBackwards,
      onSuperSmallSkipAhead,
      onSuperSmallSkipBackwards,
      onToggleFullScreen,
      onToggleMute,
    ],
  );
};
