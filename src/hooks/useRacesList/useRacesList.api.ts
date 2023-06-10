import { SEASON_TO_F1_ID_MAP, SupportedSeasons } from "../../constants/seasons";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { isNotNullable } from "../../utils/usNotNullable";
import { RaceData } from "./useRacesList.types";

export const fetchRacesList = async (seasonId: SupportedSeasons, signal: AbortSignal): Promise<RaceData[]> => {
  const seasonApiId = SEASON_TO_F1_ID_MAP[seasonId];
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${seasonApiId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const containers = body.resultObj.containers
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c?.metadata?.genres?.includes("RACE"));

  const uniqueContainers = uniqueById(containers);
  const races = uniqueContainers
    .map((racePage: any) => {
      const racePageId = String(racePage.metadata.emfAttributes.PageID);
      const title = racePage.metadata.shortDescription;
      const pictureUrl = racePage.metadata.pictureUrl;
      const countryName = racePage.metadata.emfAttributes.Meeting_Country_Name;
      const startDate = new Date(racePage.metadata.emfAttributes.Meeting_Start_Date);
      const endDate = new Date(racePage.metadata.emfAttributes.Meeting_End_Date);
      const roundNumber = +racePage.metadata.emfAttributes.Championship_Meeting_Ordinal;
      const description = racePage.metadata.emfAttributes.Meeting_Official_Name;
      const countryId = racePage.metadata.emfAttributes.MeetingCountryKey;

      if (!title.toLowerCase().includes("grand prix")) {
        return null;
      }

      return {
        id: racePageId,
        seasonId,
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
    .filter(isNotNullable)
    .sort((a, b) => b.roundNumber - a.roundNumber);

  return races;
};
