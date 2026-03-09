import { useCallback, useEffect, useState } from "react";
import posthog from "posthog-js";
import { fetchZiumOffsetsInfo } from "./useZiumOffsetsInfo.api";

export const useZiumOffsetsInfo = () => {
  const [offsetsInfo, setOffsetsInfo] = useState<string[]>([]);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const data = await fetchZiumOffsetsInfo(signal);
      setOffsetsInfo(data);
    } catch (error) {
      posthog.captureException(error);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchData]);

  return offsetsInfo;
};
