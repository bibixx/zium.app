import { isValid } from "date-fns";
import { EventGenre, EVENT_GENRES } from "../../constants/races";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { RaceDetailsData } from "./useRacesDetails.types";

export const fetchRaceDetailsId = async (raceId: string, signal: AbortSignal): Promise<RaceDetailsData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const liveAndReplayEvents = getReplayEvents(body);
  const scheduledEvents = getScheduledEvents(body);

  const liveAndReplayDetails = liveAndReplayEvents
    .filter((r: any) => EVENT_GENRES.includes(r.metadata.genres[0]?.toLowerCase()))
    .map((e) => mapEventToRaceDetailsData(e, true));

  const scheduledDetails = scheduledEvents
    .filter((r: any) => EVENT_GENRES.includes(r.metadata.genres[0]?.toLowerCase()))
    .map((e) => mapEventToRaceDetailsData(e, false));

  const raceDetails = uniqueById([...liveAndReplayDetails, ...scheduledDetails]).sort(
    (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0),
  );

  return raceDetails;
};

const getReplayEvents = (body: any): any[] => {
  const replays = body.resultObj.containers
    .filter((c: any) => c.metadata.label?.includes("Replays") || c.metadata.label?.includes("Weekend Sessions"))
    .flatMap((c: any) => c.retrieveItems.resultObj.containers)
    .filter((c: any) => c.metadata.emfAttributes.Series === "FORMULA 1");

  return replays ?? [];
};

const getScheduledEvents = (body: any): any[] => {
  const scheduled = body.resultObj.containers
    .filter((c: any) => c.layout === "schedule")
    .flatMap((c: any) => c.retrieveItems.resultObj.containers);

  const f1Scheduled = scheduled.find((s: any) => s.eventName === "FORMULA 1");

  return f1Scheduled?.events ?? [];
};

const getDates = (event: any) => {
  // let startDate = null;
  let startDate = new Date(0);

  if (
    event.metadata.emfAttributes.sessionStartDate > 0 &&
    isValid(new Date(event.metadata.emfAttributes.sessionStartDate))
  ) {
    startDate = new Date(event.metadata.emfAttributes.sessionStartDate);
  }

  // let endDate = null;
  let endDate = new Date(0);
  if (
    event.metadata.emfAttributes.sessionEndDate > 0 &&
    isValid(new Date(event.metadata.emfAttributes.sessionEndDate))
  ) {
    endDate = new Date(event.metadata.emfAttributes.sessionEndDate);
  }

  return { startDate, endDate };
};

const mapEventToRaceDetailsData = (event: any, isReplay: boolean): RaceDetailsData => {
  const { startDate, endDate } = getDates(event);

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
    startDate,
    endDate,
    roundNumber: +event.metadata.emfAttributes.Meeting_Number,
    isSingleEvent: false,
    genre:
      event.metadata.contentSubtype !== "REPLAY" && event.metadata.contentSubtype !== "LIVE_EVENT"
        ? "show"
        : (event.metadata.genres[0]?.toLowerCase() as EventGenre),
  };
};
