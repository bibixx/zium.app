import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { LiveRaceData } from "./useLiveEvent.types";

export const fetchLiveEvent = async (signal: AbortSignal): Promise<LiveRaceData | null> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/395/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const containers = body.resultObj.containers.flatMap((c: any) => c.retrieveItems.resultObj.containers);

  const uniqueContainers = uniqueById(containers);

  const liveContainer = uniqueContainers.find(
    (racePage: any) => racePage?.genres?.includes("RACE") && racePage.metadata.contentSubtype === "LIVE",
  ) as any | undefined;

  if (liveContainer == null) {
    return null;
  }

  const racePageId = String(liveContainer.metadata.emfAttributes.PageID);
  const title = liveContainer.metadata.shortDescription;
  const pictureUrl = liveContainer.metadata.pictureUrl;
  const countryName = liveContainer.metadata.emfAttributes.Meeting_Country_Name;
  const startDate = new Date(liveContainer.metadata.emfAttributes.Meeting_Start_Date);
  const endDate = new Date(liveContainer.metadata.emfAttributes.Meeting_End_Date);
  const roundNumber = +liveContainer.metadata.emfAttributes.Championship_Meeting_Ordinal;
  const description = liveContainer.metadata.emfAttributes.Meeting_Official_Name;
  const countryId = liveContainer.metadata.emfAttributes.MeetingCountryKey;
  const contentId = liveContainer.metadata.contentId;

  if (!title.toLowerCase().includes("grand prix")) {
    return null;
  }

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
  };
};
