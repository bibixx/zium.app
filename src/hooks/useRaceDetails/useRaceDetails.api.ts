import { RACE_GENRES } from "../../constants/races";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { RaceDetailsData } from "./useRacesDetails.types";

export const fetchRaceDetailsId = async (raceId: string, signal: AbortSignal): Promise<RaceDetailsData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const liveAndReplayEvents = getReplayEvents(body);
  const scheduledEvents = getScheduledEvents(body);

  const liveAndReplayDetails = liveAndReplayEvents
    .filter((r: any) => RACE_GENRES.includes(r.metadata.genres[0]?.toLowerCase()))
    .map((e) => mapEventToRaceDetailsData(e, true));

  const scheduledDetails = scheduledEvents
    .filter((r: any) => RACE_GENRES.includes(r.metadata.genres[0]?.toLowerCase()))
    .map((e) => mapEventToRaceDetailsData(e, false));

  const raceDetails = uniqueById([...liveAndReplayDetails, ...scheduledDetails]).sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  return raceDetails;
};

const getReplayEvents = (body: any): any[] => {
  const replays = body.resultObj.containers
    .filter((c: any) => c.metadata.label?.includes("Replays"))
    .flatMap((c: any) => c.retrieveItems.resultObj.containers);

  return replays ?? [];
};

const getScheduledEvents = (body: any): any[] => {
  const scheduled = body.resultObj.containers
    .filter((c: any) => c.layout === "schedule")
    .flatMap((c: any) => c.retrieveItems.resultObj.containers);

  const f1Scheduled = scheduled.find((s: any) => s.eventName === "FORMULA 1");

  return f1Scheduled?.events ?? [];
};

const mapEventToRaceDetailsData = (event: any, isReplay: boolean): RaceDetailsData => {
  return {
    title: event.metadata.titleBrief,
    id: event.metadata.contentId,
    pictureUrl: event.metadata.pictureUrl,
    isLive: event.metadata.contentSubtype === "LIVE",
    hasMedia: isReplay,
    description: event.metadata.emfAttributes.Global_Title,
    contentId: event.metadata.contentId,
    countryName: event.metadata.emfAttributes.Meeting_Country_Name,
    countryId: event.metadata.emfAttributes.MeetingCountryKey,
    startDate: new Date(event.metadata.emfAttributes.sessionStartDate),
    endDate: new Date(event.metadata.emfAttributes.sessionEndDate),
    roundNumber: +event.metadata.emfAttributes.Meeting_Number,
  };
};
