import { fetchJSON } from "../../utils/api";
import { safeURLParse } from "../../utils/safeURLParse";
import { PlaybackUrl } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { streamVideoBodyValidator } from "./useStreamVideo.validator";

export type VideoStreamInfo = {
  streamType: "HLS" | "other";
  videoUrl: string;
  laURL?: string;
  entitlementToken?: string;
};

export const fetchVideoStream = async (playbackUrl: PlaybackUrl, signal: AbortSignal): Promise<VideoStreamInfo> => {
  if (!playbackUrl.needsFetching) {
    return {
      videoUrl: playbackUrl.url,
      streamType: "HLS",
      entitlementToken: playbackUrl.entitlementToken,
      laURL: playbackUrl.laURL,
    };
  }

  const baseUrl = "/2.0/R/ENG/WEB_HLS/ALL";
  const body = await fetchJSON(`${baseUrl}/${playbackUrl.url}`, {}, signal);
  const parsedBody = streamVideoBodyValidator.parse(body);

  const isHLS = parsedBody.resultObj.streamType === "HLS" || isM3u8Url(parsedBody.resultObj.url);

  return {
    videoUrl: parsedBody.resultObj.url,
    streamType: isHLS ? "HLS" : "other",
    laURL: parsedBody.resultObj.laURL,
    entitlementToken: parsedBody.resultObj.entitlementToken,
  };
};

function isM3u8Url(url: string) {
  const urlObject = safeURLParse(url, "https://domain.invalid");
  if (urlObject === null) {
    return false;
  }

  return urlObject.pathname.endsWith(".m3u8");
}
