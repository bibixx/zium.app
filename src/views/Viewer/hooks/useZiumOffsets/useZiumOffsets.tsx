import { useCallback, useEffect, useRef } from "react";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { Button } from "../../../../components/Button/Button";
import { UserOffsets, useUserOffsets } from "../../../../hooks/useUserOffests/useUserOffests";
import { useAnalytics } from "../../../../hooks/useAnalytics/useAnalytics";
import { fetchZiumOffsets } from "./useZiumOffsets.api";
import styles from "./useZiumOffsets.module.scss";

export const useZiumOffsets = (raceId: string, hasOnlyOneStream: boolean) => {
  const lastFoundOffsetTimestampRef = useRef<number>(0);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const { overrideOffsets, offsets: userOffsets } = useUserOffsets();
  const { trackError } = useAnalytics();

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const data = await fetchZiumOffsets(raceId, signal);

        if (data == null || data.timestamp <= lastFoundOffsetTimestampRef.current) {
          return;
        }

        const offsets: UserOffsets = { isUserDefined: false, additionalStreams: data.additionalStreams };
        if (userOffsets.current == null || !userOffsets.current.isUserDefined) {
          overrideOffsets(offsets);
          lastFoundOffsetTimestampRef.current = data.timestamp;
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
            <div className={styles.buttonsWrapper}>
              <Button variant="Primary" fluid onClick={() => onApply(id)}>
                Yes, update
              </Button>
              <Button variant="Secondary" fluid onClick={() => closeSnackbar(id)}>
                Dismiss
              </Button>
            </div>
          ),
          time: 10_000,
        });

        lastFoundOffsetTimestampRef.current = data.timestamp;
      } catch (error) {
        trackError(error);
      }
    },
    [closeSnackbar, userOffsets, openSnackbar, overrideOffsets, raceId, trackError],
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
};
