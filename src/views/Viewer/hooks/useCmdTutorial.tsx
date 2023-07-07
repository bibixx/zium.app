import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useSnackbars } from "../../../components/Snackbar/SnackbarsProvider";
import { SHORTCUTS, getNiceShortcutIndicator } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { LocalStorageClient } from "../../../utils/localStorageClient";

const NUMBER_OF_ADJUSTMENTS = 4;
const ADJUSTMENTS_TIME = 10_000;

export const useCmdTutorial = () => {
  const [canUseCmd, setCanUseCmdState] = useState(getCanUseCmd);
  const counterRef = useRef(0);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const { openSnackbar } = useSnackbars();

  const onResize = useCallback(() => {
    if (canUseCmd) {
      return;
    }

    if (counterRef.current === NUMBER_OF_ADJUSTMENTS) {
      return;
    }

    if (counterRef.current === 0) {
      debounceTimerRef.current = window.setTimeout(() => {
        counterRef.current = 0;
      }, ADJUSTMENTS_TIME);
    }

    window.clearTimeout(debounceTimerRef.current);
    counterRef.current++;

    if (counterRef.current === NUMBER_OF_ADJUSTMENTS) {
      openSnackbar({
        id: "pro-tip-cmd",
        title: "Pro tip",
        content: (
          <span>
            To prevent snapping, hold down {getNiceShortcutIndicator(SHORTCUTS.GRID_PRECISE)} command key while
            resizing.
          </span>
        ),
      });
      setCanUseCmd();
      setCanUseCmdState(true);
    }
  }, [canUseCmd, openSnackbar]);

  useEffect(function cleanup() {
    window.clearTimeout(debounceTimerRef.current);
  }, []);

  return { onResize };
};

const canUseCmdStorageClient = new LocalStorageClient("canUseCmd", z.boolean(), false);
export const setCanUseCmd = () => canUseCmdStorageClient.set(true);
export const getCanUseCmd = () => canUseCmdStorageClient.get();
