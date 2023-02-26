import { fetchJSON } from "../../utils/api";
import { RaceData } from "./useRacesList.types";

export const fetchRacesList = async (id: string, signal: AbortSignal): Promise<RaceData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${id}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const containers = body.resultObj.containers
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c?.metadata?.genres?.includes("RACE"));

  const races = containers
    .map((racePage: any) => {
      const racePageId = racePage.metadata.emfAttributes.PageID;
      const title = racePage.metadata.shortDescription;

      // if (!title.toLowerCase().includes("grand prix")) {
      //   return null;
      // }

      return { id: racePageId, title };
    })
    .filter((r: any) => r != null);

  return races;
};
