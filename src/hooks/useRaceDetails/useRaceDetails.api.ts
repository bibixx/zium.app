import { fetchJSON } from "../../utils/api";
import { RaceDetailsData } from "./useRacesDetails.types";

export const fetchRaceDetailsId = async (
  raceId: string,
  signal: AbortSignal,
): Promise<RaceDetailsData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const replays = body.resultObj.containers.find(
    (c: any) => c.metadata.label === "Replays",
  );

  if (replays === undefined) {
    return [];
  }

  const raceEvents = replays.retrieveItems.resultObj.containers
    .filter((r: any) =>
      ["RACE", "QUALIFYING", "PRACTICE"].includes(r.metadata.genres[0]),
    )
    .map((r: any) => ({
      title: r.metadata.title,
      id: r.metadata.contentId,
    }));

  return raceEvents;
};
