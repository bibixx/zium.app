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
  const body = await fetchJSON(`${baseUrl}/${playbackUrl}`, undefined, signal);
  const parsedBody = streamVideoBodyValidator.parse(body);

  console.log(body);

  if (parsedBody.resultObj.streamType === "HLS") {
    return { videoUrl: parsedBody.resultObj.url, streamType: "HLS" };
  }

  return {
    videoUrl: parsedBody.resultObj.url,
    laURL: parsedBody.resultObj.laURL,
    streamType: "other",
  };
};
