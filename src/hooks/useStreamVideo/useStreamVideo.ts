import { useCallback, useEffect, useReducer } from "react";
import { fetchVideoStream } from "./useStreamVideo.api";
import {
  StreamVideoState,
  StreamVideoStateAction,
} from "./useStreamVideo.types";

export const useStreamVideo = (playbackUrl: string) => {
  const [streams, dispatch] = useReducer(
    (
      state: StreamVideoState,
      action: StreamVideoStateAction
    ): StreamVideoState => {
      if (action.type === "load") {
        return { state: "loading" };
      }

      if (action.type === "error") {
        return { state: "error", error: action.error };
      }

      if (action.type === "done") {
        return { state: "done", data: action.data };
      }

      return state;
    },
    { state: "loading" }
  );

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      dispatch({ type: "load" });

      try {
        const videoUrl = await fetchVideoStream(playbackUrl, signal);
        dispatch({ type: "done", data: videoUrl });
      } catch (error) {
        dispatch({ type: "error", error: (error as Error).message });
      }
    },
    [playbackUrl]
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  return streams;
};
