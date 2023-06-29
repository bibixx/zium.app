import { z } from "zod";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { validateArray } from "../../utils/validators";
import { RaceData } from "../useRacesList/useRacesList.types";
import { mapAndStripNullable } from "../../utils/mapAndStrip";
import { bodyRootValidator, containerValidator } from "./useLiveEvents.validator";

export const fetchLiveEvents = async (signal: AbortSignal): Promise<RaceData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/395/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);
  const parsedBody = bodyRootValidator.parse(body);

  const containers = parsedBody.resultObj.containers
    .flatMap((c) => c.retrieveItems.resultObj.containers)
    .reduce(validateArray(containerValidator), [] as z.output<typeof containerValidator>[])
    .filter((c) => c.metadata.contentSubtype != null);

  const uniqueContainers = uniqueById(containers);

  const liveEvents: RaceData[] = mapAndStripNullable(uniqueContainers, (racePage) => {
    if (racePage.metadata.contentSubtype !== "LIVE") {
      return null;
    }

    const racePageId = String(racePage.metadata.contentId);
    const title = racePage.metadata.shortDescription;
    const pictureUrl = racePage.metadata.pictureUrl;
    const countryName = racePage.metadata.emfAttributes.Meeting_Country_Name;
    const startDate = new Date(racePage.metadata.emfAttributes.Meeting_Start_Date);
    const endDate = new Date(racePage.metadata.emfAttributes.Meeting_End_Date);
    const roundNumber = racePage.metadata.emfAttributes.Meeting_Number;
    const description = racePage.metadata.emfAttributes.Global_Title;
    const countryId = racePage.metadata.emfAttributes.MeetingCountryKey;
    const contentId = racePage.metadata.contentId;
    const isLive = racePage.metadata.contentSubtype === "LIVE";

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
      genre: racePage.metadata.genres[0],
    };
  });

  return liveEvents;
};
