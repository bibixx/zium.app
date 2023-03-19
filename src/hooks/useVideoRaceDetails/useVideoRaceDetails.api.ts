import { fetchJSON } from "../../utils/api";
import { StreamDataDTO } from "./useVideoRaceDetails.types";

export const fetchRaceStreams = async (raceId: string, signal: AbortSignal) => {
  const url = `/3.0/R/ENG/BIG_SCREEN_HLS/ALL/CONTENT/VIDEO/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const streams = body.resultObj.containers[0].metadata.additionalStreams as StreamDataDTO[];
  const season = body.resultObj.containers[0].metadata.season;
  const isLive = body.resultObj.containers[0].metadata.contentSubtype === "LIVE";

  return { streams, season, isLive };
};
