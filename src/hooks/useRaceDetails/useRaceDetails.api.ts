import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { RaceDetailsData } from "./useRacesDetails.types";

export const fetchRaceDetailsId = async (raceId: string, signal: AbortSignal): Promise<RaceDetailsData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const replayEvents = getReplayEvents(body);
  const scheduledEvents = getScheduledEvents(body);

  const raceEvents = uniqueById([...scheduledEvents, ...replayEvents]);

  const raceDetails = raceEvents
    .filter((r: any) =>
      ["race", "qualifying", "practice", "sprint qualifying"].includes(r.metadata.genres[0]?.toLowerCase()),
    )
    .map(mapEventToRaceDetailsData)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return raceDetails;
};

const getReplayEvents = (body: any): RaceDetailsData[] => {
  const replays = body.resultObj.containers
    .filter((c: any) => c.metadata.label?.includes("Replays"))
    .flatMap((c: any) => c.retrieveItems.resultObj.containers);

  return replays ?? [];
};

const getScheduledEvents = (body: any): RaceDetailsData[] => {
  const scheduled = body.resultObj.containers
    .filter((c: any) => c.layout === "schedule")
    .flatMap((c: any) => c.retrieveItems.resultObj.containers);

  const f1Scheduled = scheduled.find((s: any) => s.eventName === "FORMULA 1");

  return f1Scheduled?.events ?? [];
};

const mapEventToRaceDetailsData = (event: any): RaceDetailsData => {
  return {
    title: event.metadata.titleBrief,
    id: event.metadata.contentId,
    pictureUrl: event.metadata.pictureUrl,
    startDate: new Date(event.metadata.emfAttributes.sessionStartDate),
    isLive: event.metadata.contentSubtype === "LIVE_EVENT" && event.metadata.emfAttributes.state === "Live",
  };
};
