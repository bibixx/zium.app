import { z } from "zod";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { validateArray } from "../../utils/validators";
import { RaceData } from "../useRacesList/useRacesList.types";
import { bodyRootValidator, containerValidator } from "./useLiveEvent.validator";

export const fetchLiveEvent = async (signal: AbortSignal): Promise<RaceData | null> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/395/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);
  const parsedBody = bodyRootValidator.parse(body);

  const containers = parsedBody.resultObj.containers
    .flatMap((c) => c.retrieveItems.resultObj.containers)
    .reduce(validateArray(containerValidator), [] as z.output<typeof containerValidator>[])
    .filter((c) => c.metadata.contentSubtype != null);

  const uniqueContainers = uniqueById(containers);

  const liveContainer = uniqueContainers.find((racePage) => racePage.metadata.contentSubtype === "LIVE");

  if (liveContainer == null) {
    return null;
  }

  const racePageId = String(liveContainer.metadata.emfAttributes.PageID);
  const title = liveContainer.metadata.shortDescription;
  const pictureUrl = liveContainer.metadata.pictureUrl;
  const countryName = liveContainer.metadata.emfAttributes.Meeting_Country_Name;
  const startDate = new Date(liveContainer.metadata.emfAttributes.Meeting_Start_Date);
  const endDate = new Date(liveContainer.metadata.emfAttributes.Meeting_End_Date);
  const roundNumber = liveContainer.metadata.emfAttributes.Meeting_Number;
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
