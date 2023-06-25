/* eslint-disable @typescript-eslint/no-explicit-any */
import { EVENT_GENRES } from "../../constants/races";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { RaceData } from "../useRacesList/useRacesList.types";

export const fetchLiveEvent = async (signal: AbortSignal): Promise<RaceData | null> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/395/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const containers = body.resultObj.containers
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c?.metadata?.contentSubtype != null);

  const uniqueContainers = uniqueById(containers) as any[];

  const liveContainer = uniqueContainers.find(
    (racePage: any) =>
      racePage.metadata.contentSubtype === "LIVE" && EVENT_GENRES.includes(racePage.metadata.genres[0]?.toLowerCase()),
  );

  if (liveContainer == null) {
    return null;
  }

  const racePageId = String(liveContainer.metadata.emfAttributes.PageID);
  const title = liveContainer.metadata.shortDescription;
  const pictureUrl = liveContainer.metadata.pictureUrl;
  const countryName = liveContainer.metadata.emfAttributes.Meeting_Country_Name;
  const startDate = new Date(liveContainer.metadata.emfAttributes.Meeting_Start_Date);
  const endDate = new Date(liveContainer.metadata.emfAttributes.Meeting_End_Date);
  const roundNumber = +liveContainer.metadata.emfAttributes.Meeting_Number;
  const description = liveContainer.metadata.emfAttributes.Global_Title;
  const countryId = liveContainer.metadata.emfAttributes.MeetingCountryKey;
  const contentId = liveContainer.metadata.contentId;
  const isLive = liveContainer.metadata.contentSubtype === "LIVE";

  return {
    id: racePageId,
    contentId,
    title,
    pictureUrl,
    countryName,
    startDate,
    endDate,
    roundNumber,
    description,
    countryId,
    isLive,
    hasMedia: isLive,
    isSingleEvent: false,
    genre: liveContainer.metadata.genres[0],
  };
};
