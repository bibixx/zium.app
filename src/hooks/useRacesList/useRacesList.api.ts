import { fetchJSON } from "../../utils/api";
import { RaceData } from "./useRacesList.types";

export const fetchRacesList = async (id: string, signal: AbortSignal): Promise<RaceData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${id}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const containers = body.resultObj.containers
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c?.metadata?.genres?.includes("RACE"));

  const uniqueContainers = getUnique(containers);
  const races = uniqueContainers
    .map((racePage: any) => {
      const racePageId = racePage.metadata.emfAttributes.PageID;
      const title = racePage.metadata.shortDescription;
      const pictureUrl = racePage.metadata.pictureUrl;
      const countryName = racePage.metadata.emfAttributes.Meeting_Country_Name;
      const startDate = new Date(racePage.metadata.emfAttributes.Meeting_Start_Date);
      const endDate = new Date(racePage.metadata.emfAttributes.Meeting_End_Date);
      const roundNumber = +racePage.metadata.emfAttributes.Championship_Meeting_Ordinal;
      const description = racePage.metadata.emfAttributes.Meeting_Official_Name;
      const countryId = racePage.metadata.emfAttributes.MeetingCountryKey;

      if (!title.toLowerCase().includes("grand prix") || startDate.getTime() > Date.now()) {
        return null;
      }

      return {
        id: racePageId,
        title,
        pictureUrl,
        countryName,
        startDate,
        endDate,
        roundNumber,
        description,
        countryId,
      };
    })
    .filter(isNotNullable);

  return races;
};

const getUnique = <T extends { id: string }>(array: T[]) => {
  const visitedIds: Record<string, boolean> = {};

  return array.filter((el) => {
    const found = visitedIds[el.id];

    if (found) {
      return false;
    }

    visitedIds[el.id] = true;
    return true;
  });
};

const isNotNullable = <T>(el: T | null | undefined): el is T => {
  return el != null;
};
