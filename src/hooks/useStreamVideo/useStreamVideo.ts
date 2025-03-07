import { useCallback, useEffect, useReducer } from "react";
import { captureException } from "@sentry/browser";
import { fetchVideoStream } from "./useStreamVideo.api";
import { StreamVideoState, StreamVideoStateAction } from "./useStreamVideo.types";
import { StreamVideoError } from "./useStreamVideo.utils";

export const useStreamVideo = (playbackUrl: string | null) => {
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
      if (playbackUrl === "__DEBUG__") {
        dispatch({
          type: "done",
          data: {
            streamType: "HLS",
            videoUrl: "https://cph-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
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
        // const data = {
        //   videoUrl:
        //     "https://ott-video-cf.formula1.com/v2/pa_cGF0aDolMkY4M2FjOGZlMDdkZGQxMGNmJTJGb3V0JTJGdjElMkY3MTcxMTkwNmJjNTg0MmI5YjcxY2I3ZmRlMDJkYjI5MXxraWQ6MTA0MnxleHA6MTY3Nzk0MTU5M3x0dGw6MTQ0MHxnZW86UEx8c3RyZWFtVHlwZTpEQVNIV1Z8dG9rZW46Wlh0blhFfjg4MTctMy1aQ1BWc3NIekJ5eUZ4NU1GZWtuc24xU35kcnBESV8_/83ac8fe07ddd10cf/out/v1/71711906bc5842b9b71cb7fde02db291/index.mpd?start=1677842103&end=1677847731",
        //   laURL:
        //     "https://f1tv.formula1.com/2.0/R/ENG/WEB_HLS/ALL/CONTENT/LA/widevine?channelId=1018&contentId=1000006401",
        // };

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
