import { PlayerAPI } from "bitmovin-player";
import { useCallback } from "react";
import { Key } from "ts-key-enum";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { isWindows } from "../../../utils/platform";

export const useGlobalShortcuts = (player: PlayerAPI | null) => {
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

  const onSkipAhead = useCallback(
    (e: KeyboardEvent) => {
      const meta = isWindows ? e.ctrlKey : e.metaKey;
      const timeDiff = meta ? 1 : 30;

      player?.seek(player.getCurrentTime() + timeDiff);
    },
    [player],
  );

  const onSkipBackwards = useCallback(
    (e: KeyboardEvent) => {
      const meta = isWindows ? e.ctrlKey : e.metaKey;
      const timeDiff = meta ? 1 : 30;

      player?.seek(player.getCurrentTime() - timeDiff);
    },
    [player],
  );

  const scope = useHotkeysStack(true, true, "Global");
  useScopedHotkeys("space", scope, onPlayClick);
  useScopedHotkeys(Key.ArrowRight, scope, onSkipAhead, { ignoreModifiers: true, preventDefault: true });
  useScopedHotkeys(Key.ArrowLeft, scope, onSkipBackwards, { ignoreModifiers: true, preventDefault: true });
};
