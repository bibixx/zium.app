import { useCallback, useEffect, useRef, useState } from "react";
import { captureException } from "@sentry/browser";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { Button } from "../../../../components/Button/Button";
import { UserOffsets, useUserOffsets } from "../../../../hooks/useUserOffests/useUserOffests";
import { useCloseAllSnackbarsOnUnmount } from "../../../../hooks/useCloseAllSnackbarsOnUnmount/useCloseAllSnackbarsOnUnmount";
import { fetchZiumOffsets } from "./useZiumOffsets.api";

export const useZiumOffsets = (raceId: string, hasOnlyOneStream: boolean, setPaused: (isPaused: boolean) => void) => {
  const lastFetchedOffsetTimestampRef = useRef<number | null>(null);
  const isFirstFetchRef = useRef(true);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const { overrideOffsets, offsets: userOffsets } = useUserOffsets();
  const registerSnackbarForUnmount = useCloseAllSnackbarsOnUnmount();
  const { setState: setDialogState, state: dialogState } = useZiumOffsetsDialog();

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const data = await fetchZiumOffsets(raceId, signal);
        const isFirstFetch = isFirstFetchRef.current;
        isFirstFetchRef.current = false;
        if (data == null) {
          return;
        }

        const lastFetchedOffsetTimestamp = lastFetchedOffsetTimestampRef.current;
        const shouldTryToApplyOffset = getShouldTryToApplyOffset(data.timestamp, lastFetchedOffsetTimestamp);
        lastFetchedOffsetTimestampRef.current = data.timestamp;

        if (!shouldTryToApplyOffset) {
          return;
        }

        const offsets: UserOffsets = {
          isUserDefined: false,
          additionalStreams: data.additionalStreams,
          lastAppliedZiumOffsets: data.timestamp,
        };

        const shouldAskForPermission = userOffsets.current !== null && userOffsets.current.isUserDefined;

        if (!shouldAskForPermission) {
          overrideOffsets(offsets);
          return;
        }

        if (isFirstFetch) {
          const onClose = () => {
            setPaused(false);
            setDialogState({ isOpen: false });
          };
          const onApply = () => {
            overrideOffsets(offsets);
            onClose();
          };

          setDialogState({ isOpen: true, onApply, onClose });
          setPaused(true);

          return;
        }

        const onApply = (snackbarId: string) => {
          overrideOffsets(offsets);
          closeSnackbar(snackbarId);
        };

        const id = openSnackbar({
          title: "Update time offsets?",
          content: "We have updated time offsets for this session. Would you like to load them?",
          actions: (
            <>
              <Button variant="Secondary" size="Action" fluid onClick={() => closeSnackbar(id)}>
                Dismiss
              </Button>
              <Button variant="Primary" size="Action" fluid onClick={() => onApply(id)}>
                Update
              </Button>
            </>
          ),
          time: 10_000,
        });

        registerSnackbarForUnmount(id);
      } catch (error) {
        captureException(error);
      }
    },
    [
      raceId,
      userOffsets,
      openSnackbar,
      registerSnackbarForUnmount,
      overrideOffsets,
      setDialogState,
      closeSnackbar,
      setPaused,
    ],
  );

  useEffect(() => {
    if (hasOnlyOneStream) {
      return;
    }

    const abortController = new AbortController();
    fetchData(abortController.signal);

    const interval = setInterval(() => {
      fetchData(abortController.signal);
    }, 60_000);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, [fetchData, hasOnlyOneStream]);

  return { dialogState };
};

const getShouldTryToApplyOffset = (dataTimestamp: number, lastFetchedOffsetTimestamp: number | null) => {
  return lastFetchedOffsetTimestamp === null || dataTimestamp > lastFetchedOffsetTimestamp;
};

type UseZiumOffsetsDialogState =
  | {
      isOpen: true;
      onApply: () => void;
      onClose: () => void;
    }
  | {
      isOpen: false;
      onApply?: undefined;
      onClose?: undefined;
    };
const useZiumOffsetsDialog = () => {
  const [state, setState] = useState<UseZiumOffsetsDialogState>({ isOpen: false });

  return { state, setState };
};
