import { useCallback, useEffect, useReducer } from "react";
import { captureException } from "@sentry/browser";
import { PlaybackUrl } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { fetchVideoStream } from "./useStreamVideo.api";
import { StreamVideoState, StreamVideoStateAction } from "./useStreamVideo.types";
import { StreamVideoError } from "./useStreamVideo.utils";

export const useStreamVideo = (playbackUrl: PlaybackUrl | null) => {
  const [streams, dispatch] = useReducer(
    (state: StreamVideoState, action: StreamVideoStateAction): StreamVideoState => {
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
    { state: "loading" },
  );

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      if (playbackUrl?.isDebug) {
        dispatch({
          type: "done",
          data: {
            streamType: "other",
            // videoUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_with_multiple_tiled_thumbnails.mpd",
            videoUrl: "http://dash.edgesuite.net/akamai/bbb_30fps/bbb_with_tiled_thumbnails.mpd",
          },
        });
        return;
      }

      if (playbackUrl === null) {
        dispatch({ type: "error", error: new StreamVideoError("NO_PLAYBACK_URL") });
        return;
      }

      dispatch({ type: "load" });

      try {
        const data = await fetchVideoStream(playbackUrl, signal);

        if (data.videoUrl.includes("akamaized")) {
          console.log("retry");

          fetchData(signal);
          return;
        }

        dispatch({ type: "done", data });
      } catch (error) {
        dispatch({ type: "error", error: error });
        captureException(error);
      }
    },
    [playbackUrl],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  return streams;
};
