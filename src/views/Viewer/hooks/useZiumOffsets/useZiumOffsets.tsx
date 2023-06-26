import { useCallback, useEffect, useRef } from "react";
import equal from "fast-deep-equal";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { Button } from "../../../../components/Button/Button";
import { useUserOffsets } from "../../../../hooks/useUserOffests/useUserOffests";
import { useAnalytics } from "../../../../hooks/useAnalytics/useAnalytics";
import { fetchZiumOffsets } from "./useZiumOffsets.api";
import styles from "./useZiumOffsets.module.scss";

export const useZiumOffsets = (raceId: string, hasOnlyOneStream: boolean) => {
  const lastFoundOffsetTimestampRef = useRef<number>(0);
  const isFirstSuccessfulFetchRef = useRef(true);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const { overrideOffsets, offsets } = useUserOffsets();
  const { trackError } = useAnalytics();

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const data = await fetchZiumOffsets(raceId, signal);
        const isFirstSuccessfulFetch = isFirstSuccessfulFetchRef.current;
        isFirstSuccessfulFetchRef.current = false;

        if (
          data == null ||
          data.timestamp <= lastFoundOffsetTimestampRef.current ||
          equal(data.additionalStreams, offsets.current?.additionalStreams)
        ) {
          return;
        }

        if (offsets.current == null && isFirstSuccessfulFetch) {
          overrideOffsets({ additionalStreams: data.additionalStreams });
          lastFoundOffsetTimestampRef.current = data.timestamp;
          return;
        }

        const onApply = (snackbarId: string) => {
          overrideOffsets({ additionalStreams: data.additionalStreams });
          closeSnackbar(snackbarId);
        };

        const id = openSnackbar({
          title: "New offsets available",
          content: "Do you want to apply them?",
          actions: (
            <div className={styles.buttonsWrapper}>
              <Button variant="Primary" fluid onClick={() => onApply(id)}>
                Yes
              </Button>
              <Button variant="Secondary" fluid onClick={() => closeSnackbar(id)}>
                No
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
    [closeSnackbar, offsets, openSnackbar, overrideOffsets, raceId, trackError],
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
