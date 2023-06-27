import { useCallback, useEffect, useState } from "react";
import { useAnalytics } from "../../../../hooks/useAnalytics/useAnalytics";
import { fetchZiumOffsetsInfo } from "./useZiumOffsetsInfo.api";

export const useZiumOffsetsInfo = () => {
  const [offsetsInfo, setOffsetsInfo] = useState<string[]>([]);
  const { trackError } = useAnalytics();

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      try {
        const data = await fetchZiumOffsetsInfo(signal);
        setOffsetsInfo(data);
      } catch (error) {
        trackError(error);
      }
    },
    [trackError],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchData]);

  return offsetsInfo;
};
