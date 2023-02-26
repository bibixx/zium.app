import { useCallback, useEffect, useReducer } from "react";
import { fetchRaceStreams } from "./useVideoRaceDetails.api";
import { StreamsState, StreamsStateAction } from "./useVideoRaceDetails.types";
import { collectStreams } from "./useVideoRaceDetails.utils";

export const useVideoRaceDetails = (raceId: string) => {
  const [streams, dispatch] = useReducer(
    (state: StreamsState, action: StreamsStateAction): StreamsState => {
      if (action.type === "load") {
        return { state: "loading" };
      }

      if (action.type === "error") {
        return { state: "error", error: action.error };
      }

      if (action.type === "done") {
        return { state: "done", streams: action.streams, season: action.season };
      }

      return state;
    },
    { state: "loading" },
  );

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      dispatch({ type: "load" });

      try {
        const { streams, season } = await fetchRaceStreams(raceId, signal);
        const collectedStreams = collectStreams(streams);

        dispatch({ type: "done", streams: collectedStreams, season });
      } catch (error) {
        dispatch({ type: "error", error: (error as Error).message });
      }
    },
    [raceId],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  return streams;
};
