import { fetchJSON } from "../../utils/api";

export const fetchVideoStream = async (
  playbackUrl: string,
  signal: AbortSignal
): Promise<string> => {
  const baseUrl = "/2.0/R/ENG/BIG_SCREEN_HLS/ALL";
  const body = await fetchJSON(`${baseUrl}/${playbackUrl}`, undefined, signal);

  return body.resultObj.url;
};
