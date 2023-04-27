import { useCallback, useEffect, useState } from "react";
import { fetchLiveEvent } from "./useLiveEvent.api";
import { LiveEventState } from "./useLiveEvent.types";

export const useLiveEvent = () => {
  const [state, setState] = useState<LiveEventState>({ state: "loading" });

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const liveRace = await fetchLiveEvent(signal);
      setState({ state: "done", data: liveRace });
    } catch (error) {
      console.error(error);
    }
  }, []);

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

  return state;
};
