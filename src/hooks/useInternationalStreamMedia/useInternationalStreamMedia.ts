import { useCallback, useEffect, useMemo, useState } from "react";

import { useStreamVideo } from "../useStreamVideo/useStreamVideo";
import { MainStreamInfo } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { Response } from "../../types/Response";
import { fetchManifest } from "./useInternationalStreamMedia.api";
import { VideoStreamMedia } from "./useInternationalStreamMedia.types";

export const useInternationalStreamMedia = (defaultStreams: MainStreamInfo[]) => {
  const internationalStream = useMemo(
    () => defaultStreams.find((stream) => stream.type === "international"),
    [defaultStreams],
  );
  const streamVideoState = useStreamVideo(internationalStream?.playbackUrl ?? null);
  const [manifestState, setManifestState] = useState<Response<VideoStreamMedia | null>>({ state: "loading" });

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      if (streamVideoState.state !== "done") {
        return;
      }

      try {
        setManifestState({ state: "loading" });

        const result = await fetchManifest(streamVideoState.data.videoUrl, signal);

        setManifestState({ state: "done", data: result });
      } catch (error) {
        setManifestState({ state: "error", error: error });
      }
    },
    [streamVideoState],
  );

  useEffect(() => {
    if (internationalStream == null) {
      setManifestState({ state: "done", data: null });
      return;
    }

    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData, internationalStream]);

  return manifestState;
};
