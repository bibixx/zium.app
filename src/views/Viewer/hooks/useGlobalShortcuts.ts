import { PlayerAPI } from "bitmovin-player";
import { useCallback } from "react";
import { Key } from "ts-key-enum";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";

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

  const onSkipAhead = useCallback(() => {
    player?.seek(player.getCurrentTime() + 30);
  }, [player]);

  const onSkipBackwards = useCallback(() => {
    player?.seek(player.getCurrentTime() - 30);
  }, [player]);

  const scope = useHotkeysStack(true, true, "Global");
  useScopedHotkeys("space", scope, onPlayClick);
  useScopedHotkeys(Key.ArrowRight, scope, onSkipAhead);
  useScopedHotkeys(Key.ArrowLeft, scope, onSkipBackwards);
};
