import { useCallback, useEffect, useMemo, useState } from "react";
import { GridWindow } from "../../../types/GridWindow";

interface UseFocusedVideoArguments {
  windows: GridWindow[];
}
export const useVideoAudio = ({ windows }: UseFocusedVideoArguments) => {
  const mainWindow = useMemo(() => windows.find((w) => w.type === "main"), [windows]);

  const [volume, setVolume] = useState(100);
  const [wasOverwritten, setWasOverwritten] = useState(false);
  const [audioFocusedWindow, setFocusedWindow] = useState(mainWindow?.id ?? null);

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
