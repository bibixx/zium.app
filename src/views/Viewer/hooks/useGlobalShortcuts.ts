import { PlayerAPI } from "bitmovin-player";
import { useCallback } from "react";
import { toggleFullScreen } from "../../../utils/toggleFullScreen";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { useEasterEgg } from "../../../hooks/useEasterEgg/useEasterEgg";

export const useGlobalShortcuts = (player: PlayerAPI | null) => {
  useEasterEgg();

  const onPlayClick = useCallback(() => {
    if (document.activeElement != null && document.activeElement !== document.body) {
      return;
    }

    if (player == null) {
      return;
    }

    if (player.isPlaying()) {
      player.pause("ui");
    } else {
      player.play("ui");
    }
  }, [player]);

  const onBigSkipAhead = useCallback(() => {
    const timeDiff = 30;

    player?.seek(player.getCurrentTime() + timeDiff);
  }, [player]);

  const onSmallSkipAhead = useCallback(() => {
    const timeDiff = 1;

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

  const onToggleFullScreen = useCallback(() => {
    toggleFullScreen();
  }, []);

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
          keys: SHORTCUTS.TOGGLE_FULL_SCREEN,
          action: onToggleFullScreen,
        },
      ],
    }),
    [onBigSkipAhead, onBigSkipBackwards, onPlayClick, onSmallSkipAhead, onSmallSkipBackwards, onToggleFullScreen],
  );
};
