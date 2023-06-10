import { useCallback, useEffect, useRef, useState } from "react";

const NUMBER_OF_ADJUSTMENTS = 5;
const ADJUSTMENTS_TIME = 10_000;
const POPUP_VISIBILITY_TIME = 5_000;

export const useCmdTutorial = () => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [canUseCmd, setCanUseCmdState] = useState(getCanUseCmd);
  const counterRef = useRef(0);
  const endTimerRef = useRef<number | undefined>(undefined);
  const debounceTimerRef = useRef<number | undefined>(undefined);

  const onResize = useCallback(() => {
    if (shouldShowTutorial || canUseCmd) {
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
      setShouldShowTutorial(true);
      setCanUseCmd();
      setCanUseCmdState(true);

      endTimerRef.current = window.setTimeout(() => {
        setShouldShowTutorial(false);
      }, POPUP_VISIBILITY_TIME);
    }
  }, [canUseCmd, shouldShowTutorial]);

  useEffect(function cleanup() {
    window.clearTimeout(endTimerRef.current);
    window.clearTimeout(debounceTimerRef.current);
  }, []);

  return { onResize, shouldShowTutorial };
};

const CAN_USE_CMD_STORAGE_KEY = "canUseCmd";
export const setCanUseCmd = () => localStorage.setItem(CAN_USE_CMD_STORAGE_KEY, "true");
export const getCanUseCmd = () => localStorage.getItem(CAN_USE_CMD_STORAGE_KEY) === "true";
