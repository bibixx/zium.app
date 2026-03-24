import { useCallback, useEffect, useMemo, useState } from "react";

import { posthog } from "posthog-js";
import { useStreamVideo } from "../useStreamVideo/useStreamVideo";
import { MainStreamInfo } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { Response } from "../../types/Response";
import { fetchManifest } from "./useInternationalStreamMedia.api";
import { VideoStreamMedia } from "./useInternationalStreamMedia.types";

function buildMediaFromApiData(audioTrackNames: Record<string, string>, audioDefault?: string): VideoStreamMedia {
  return {
    AUDIO: Object.entries(audioTrackNames).map(([lang, name]) => ({
      AUTOSELECT: lang === audioDefault,
      DEFAULT: lang === audioDefault,
      TYPE: "AUDIO" as const,
      "GROUP-ID": "audio",
      LANGUAGE: lang,
      NAME: name,
      URI: "",
    })),
  };
}

export const useInternationalStreamMedia = (defaultStreams: MainStreamInfo[]) => {
  const internationalStream = useMemo(
    () => defaultStreams.find((stream) => stream.type === "international"),
    [defaultStreams],
  );

  const hasApiAudioData = internationalStream?.audioTrackNames != null;

  const streamVideoState = useStreamVideo(hasApiAudioData ? null : (internationalStream?.playbackUrl ?? null));
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
        posthog.captureException(error);
      }
    },
    [streamVideoState],
  );

  useEffect(() => {
    if (internationalStream == null) {
      setManifestState({ state: "done", data: null });
      return;
    }

    if (hasApiAudioData) {
      setManifestState({
        state: "done",
        data: buildMediaFromApiData(internationalStream.audioTrackNames!, internationalStream.audioDefault),
      });
      return;
    }

    // Fallback for older races that don't have audioTrackNames in the API response.
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData, internationalStream, hasApiAudioData]);

  return manifestState;
};
