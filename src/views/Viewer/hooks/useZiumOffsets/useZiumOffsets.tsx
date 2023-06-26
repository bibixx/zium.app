import { useCallback, useEffect, useRef } from "react";
import equal from "fast-deep-equal";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { Button } from "../../../../components/Button/Button";
import { useUserOffsets } from "../../../../hooks/useUserOffests/useUserOffests";
import { useAnalytics } from "../../../../hooks/useAnalytics/useAnalytics";
import { fetchZiumOffsets } from "./useZiumOffsets.api";
import styles from "./useZiumOffsets.module.scss";

export const useZiumOffsets = (raceId: string) => {
  const lastFoundOffsetTimestampRef = useRef<number>(0);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const { updateOffset, offsets } = useUserOffsets();
  const { trackError } = useAnalytics();

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const data = await fetchZiumOffsets(raceId, signal);

        if (
          data == null ||
          data.timestamp <= lastFoundOffsetTimestampRef.current ||
          equal(data.data, offsets.current)
        ) {
          return;
        }

        const onApply = (snackbarId: string) => {
          Object.entries(data.data).map(([key, value]) => {
            updateOffset(key, value);
          });

          closeSnackbar(snackbarId);
        };

        const id = openSnackbar({
          title: "New offsets available",
          content: (
            <div>
              <div>Do you want to apply them?</div>
              <div className={styles.buttonsWrapper}>
                <Button variant="Primary" fluid onClick={() => onApply(id)}>
                  Yes
                </Button>
                <Button variant="Secondary" fluid onClick={() => closeSnackbar(id)}>
                  No
                </Button>
              </div>
            </div>
          ),
          time: 10_000,
        });

        lastFoundOffsetTimestampRef.current = data.timestamp;
      } catch (error) {
        trackError(error);
      }
    },
    [closeSnackbar, offsets, openSnackbar, raceId, trackError, updateOffset],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    const interval = setInterval(() => {
      fetchData(abortController.signal);
    }, 10_000);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, [fetchData]);
};
