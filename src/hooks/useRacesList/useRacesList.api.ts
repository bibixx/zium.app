import { isValid } from "date-fns";
import { SEASON_TO_F1_ID_MAP, SupportedSeasons } from "../../constants/seasons";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { isNotNullable } from "../../utils/isNotNullable";
import { RaceData } from "./useRacesList.types";

const getDates = (racePage: any) => {
  let startDate = new Date();

  if (isValid(new Date(racePage.metadata.emfAttributes.Meeting_Start_Date))) {
    startDate = new Date(racePage.metadata.emfAttributes.Meeting_Start_Date);
  }

  let endDate = new Date();
  if (isValid(new Date(racePage.metadata.emfAttributes.Meeting_End_Date))) {
    endDate = new Date(racePage.metadata.emfAttributes.Meeting_End_Date);
  }

  return { startDate, endDate };
};

export const fetchRacesList = async (seasonId: SupportedSeasons, signal: AbortSignal): Promise<RaceData[]> => {
  const seasonApiId = SEASON_TO_F1_ID_MAP[seasonId];
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${seasonApiId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);
  const containers = body.resultObj.containers
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c?.metadata?.genres?.includes("RACE") || c?.metadata?.genres?.includes("FULL RACE"));

  const uniqueContainers = uniqueById(containers);
  let fallbackRoundNumber = 0;

  const races = uniqueContainers
    .map((racePage: any): RaceData | null => {
      const racePageId =
        racePage.metadata.emfAttributes.PageID == null ? null : String(racePage.metadata.emfAttributes.PageID);
      const title = racePage.metadata.emfAttributes.Global_Meeting_Name;
      const pictureUrl = racePage.metadata.pictureUrl;
      const countryName = racePage.metadata.emfAttributes.Meeting_Country_Name;
      const { startDate, endDate } = getDates(racePage);
      const rawRoundNumber = +racePage.metadata.emfAttributes.Championship_Meeting_Ordinal;
      const roundNumber = !Number.isNaN(rawRoundNumber) && rawRoundNumber > 0 ? rawRoundNumber : fallbackRoundNumber;
      const description =
        racePage.metadata.emfAttributes.Meeting_Official_Name || racePage.metadata.emfAttributes.Global_Meeting_Name;
      const countryId = racePage.metadata.emfAttributes.MeetingCountryKey;
      const contentId = racePage.metadata.contentId;
      const isLive = racePage.metadata.contentSubtype === "LIVE";

      if (!title.toLowerCase().includes("grand prix")) {
        return null;
      }

      fallbackRoundNumber++;
      return {
        contentId,
        id: racePageId,
        title,
        pictureUrl,
        countryName,
        startDate,
        endDate,
        roundNumber,
        description,
        countryId,
        isLive,
        isSingleEvent: racePageId == null,
        genre: racePage?.metadata?.genres[0],
      };
    })
    .filter(isNotNullable)
    .sort((a, b) => b.roundNumber - a.roundNumber);

  return races;
};
