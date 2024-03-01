import { fetchJSON } from "../../utils/api";
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
    };
export const fetchVideoStream = async (playbackUrl: string, signal: AbortSignal): Promise<VideoStreamInfo> => {
  const baseUrl = "/2.0/R/ENG/WEB_HLS/ALL";
  const body = await fetchJSON(
    `${baseUrl}/${playbackUrl}`,
    {
      headers: {
        "x-f1-device-info":
          "device=web;screen=browser;os=mac os;browser=chrome;browserVersion=122.0.0.0;model=Macintosh;osVersion=14.3.1;appVersion=release-R29.0.3;playerVersion=8.129.0",
      },
    },
    signal,
  );
  const parsedBody = streamVideoBodyValidator.parse(body);

  if (parsedBody.resultObj.streamType === "HLS") {
    return { videoUrl: parsedBody.resultObj.url, streamType: "HLS" };
  }

  return {
    videoUrl: parsedBody.resultObj.url,
    laURL: parsedBody.resultObj.laURL,
    streamType: "other",
  };
};
