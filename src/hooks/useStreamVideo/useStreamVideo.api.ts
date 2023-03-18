import { fetchJSON } from "../../utils/api";

export type VideoStreamInfo =
  | {
      streamType: "HLS";
      videoUrl: string;
    }
  | {
      streamType: "other";
      videoUrl: string;
      laURL: string;
    };
export const fetchVideoStream = async (playbackUrl: string, signal: AbortSignal): Promise<VideoStreamInfo> => {
  const baseUrl = "/2.0/R/ENG/WEB_HLS/ALL";
  const body = await fetchJSON(`${baseUrl}/${playbackUrl}`, undefined, signal);

  if (body.resultObj.streamType === "HLS") {
    return { videoUrl: body.resultObj.url, streamType: "HLS" };
  }

  return {
    videoUrl: body.resultObj.url,
    laURL: body.resultObj.laURL,
    streamType: "other",
  };
};
