import { PlayerAPI } from "bitmovin-player";
import { useCallback } from "react";
import { toggleFullScreen } from "../../../utils/toggleFullScreen";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { useEasterEgg } from "../../../hooks/useEasterEgg/useEasterEgg";

export const useGlobalShortcuts = (
  player: PlayerAPI | null,
  setAreVideosPaused: (fn: (oldValue: boolean) => boolean) => void,
  setAreClosedCaptionsOn: (fn: (oldValue: boolean) => boolean) => void,
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
    const timeDiff = 30;

    player?.seek(player.getCurrentTime() + timeDiff);
  }, [player]);

  const onSmallSkipAhead = useCallback(() => {
    const timeDiff = 1;

    player?.seek(player.getCurrentTime() + timeDiff);
  }, [player]);

  const onSuperSmallSkipAhead = useCallback(() => {
    const timeDiff = 0.1;

    player?.seek(player.getCurrentTime() + timeDiff);
  }, [player]);

  const onBigSkipBackwards = useCallback(() => {
    const timeDiff = 30;

    player?.seek(player.getCurrentTime() - timeDiff);
  }, [player]);

  const onSmallSkipBackwards = useCallback(() => {
    const timeDiff = 1;

    player?.seek(player.getCurrentTime() - timeDiff);
  }, [player]);

  const onSuperSmallSkipBackwards = useCallback(() => {
    const timeDiff = 0.1;

    player?.seek(player.getCurrentTime() - timeDiff);
  }, [player]);

  const onToggleClosedCaptions = useCallback(() => {
    setAreClosedCaptionsOn((areClosedCaptionsOn) => !areClosedCaptionsOn);
  }, [setAreClosedCaptionsOn]);

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
          keys: SHORTCUTS.TOGGLE_CLOSED_CAPTIONS,
          action: onToggleClosedCaptions,
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
      onToggleClosedCaptions,
      onToggleFullScreen,
      onToggleMute,
    ],
  );
};
