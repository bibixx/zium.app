import { fetchJSON } from "../../utils/api";
import { safeURLParse } from "../../utils/safeURLParse";
import { PlaybackUrl } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { streamVideoBodyValidator } from "./useStreamVideo.validator";

export type VideoStreamInfo =
  | {
      streamType: "HLS";
      videoUrl: string;
    }
  | {
      streamType: "other";
      videoUrl: string;
      laURL?: string;
      entitlementToken?: string;
    };
export const fetchVideoStream = async (playbackUrl: PlaybackUrl, signal: AbortSignal): Promise<VideoStreamInfo> => {
  if (!playbackUrl.needsFetching) {
    return { videoUrl: playbackUrl.url, streamType: "HLS" };
  }

  const baseUrl = "/2.0/R/ENG/WEB_HLS/ALL";
  const body = await fetchJSON(`${baseUrl}/${playbackUrl.url}`, {}, signal);
  const parsedBody = streamVideoBodyValidator.parse(body);

  if (parsedBody.resultObj.streamType === "HLS") {
    return { videoUrl: parsedBody.resultObj.url, streamType: "HLS" };
  }

  if (isM3u8Url(parsedBody.resultObj.url)) {
    return { videoUrl: parsedBody.resultObj.url, streamType: "HLS" };
  }

  return {
    videoUrl: parsedBody.resultObj.url,
    laURL: parsedBody.resultObj.laURL,
    entitlementToken: parsedBody.resultObj.entitlementToken,
    streamType: "other",
  };
};

function isM3u8Url(url: string) {
  const urlObject = safeURLParse(url, "https://domain.invalid");
  if (urlObject === null) {
    return false;
  }

  return urlObject.pathname.endsWith(".m3u8");
}
