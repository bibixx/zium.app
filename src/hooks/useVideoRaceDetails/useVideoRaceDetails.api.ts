import { fetchJSON } from "../../utils/api";
import { StreamDataDTO } from "./useVideoRaceDetails.types";

export const fetchRaceStreams = async (raceId: string, signal: AbortSignal): Promise<StreamDataDTO[]> => {
  const url = `/3.0/R/ENG/BIG_SCREEN_HLS/ALL/CONTENT/VIDEO/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const streams = body.resultObj.containers[0].metadata.additionalStreams;
  return streams;
};
