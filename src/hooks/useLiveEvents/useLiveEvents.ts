import { useCallback, useEffect, useState } from "react";
import { fetchLiveEvents } from "./useLiveEvents.api";
import { LiveEventState } from "./useLiveEvents.types";

export const useLiveEvents = (refetchInterval: number) => {
  const [state, setState] = useState<LiveEventState>({ state: "loading" });

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const liveRace = await fetchLiveEvents(signal);
      setState({ state: "done", data: liveRace });
    } catch (error) {
      setState({ state: "error", error: error });
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    fetchData(abortController.signal);
    const interval = setInterval(() => {
      fetchData(abortController.signal);
    }, refetchInterval);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, [fetchData, refetchInterval]);

  return state;
};
