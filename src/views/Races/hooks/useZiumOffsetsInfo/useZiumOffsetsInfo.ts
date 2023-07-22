import { useCallback, useEffect, useState } from "react";
import { captureException } from "@sentry/browser";
import { fetchZiumOffsetsInfo } from "./useZiumOffsetsInfo.api";

export const useZiumOffsetsInfo = () => {
  const [offsetsInfo, setOffsetsInfo] = useState<string[]>([]);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const data = await fetchZiumOffsetsInfo(signal);
      setOffsetsInfo(data);
    } catch (error) {
      captureException(error);
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
