import { isValid } from "date-fns";
import { z } from "zod";
import { isRaceGenre } from "../../constants/races";
import { fetchJSON } from "../../utils/api";
import { uniqueById } from "../../utils/uniqueById";
import { validateArray } from "../../utils/validators";
import { RaceDetailsData } from "./useRacesDetails.types";
import { bodyRootValidator, eventValidator, scheduledContainerValidator, Event } from "./useRaceDetails.validator";

export const fetchRaceDetailsId = async (raceId: string, signal: AbortSignal): Promise<RaceDetailsData[]> => {
  const url = `/2.0/R/ENG/WEB_DASH/ALL/PAGE/${raceId}/F1_TV_Pro_Annual/14`;
  const body = await fetchJSON(url, undefined, signal);

  const liveAndReplayEvents = getReplayEvents(body);
  const scheduledEvents = getScheduledEvents(body);

  const liveAndReplayDetails = liveAndReplayEvents.map((e) => mapEventToRaceDetailsData(e, true));
  const scheduledDetails = scheduledEvents.map((e) => mapEventToRaceDetailsData(e, false));

  const raceDetails = uniqueById([...liveAndReplayDetails, ...scheduledDetails]).sort(
    (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0),
  );

  return raceDetails;
};

const getReplayEvents = (body: unknown) => {
  const parsedBody = bodyRootValidator.parse(body);

  const replays = parsedBody.resultObj.containers
    .filter(
      (c) =>
        c.metadata.label?.includes("Replays") ||
        c.metadata.label?.includes("Weekend Sessions") ||
        c.metadata.label?.includes("Shows & Analysis"),
    )
    .flatMap((c) => c.retrieveItems.resultObj.containers)
    .reduce(validateArray(eventValidator), [] as z.output<typeof eventValidator>[])
    .filter((c) => c.metadata.emfAttributes.Series === "FORMULA 1");

  return replays ?? [];
};

const getScheduledEvents = (body: unknown) => {
  const parsedBody = bodyRootValidator.parse(body);

  const scheduled = parsedBody.resultObj.containers
    .filter((c) => c.layout === "schedule")
    .flatMap((c) => c.retrieveItems.resultObj.containers)
    .reduce(validateArray(scheduledContainerValidator), [] as z.output<typeof scheduledContainerValidator>[]);

  const f1Scheduled = scheduled.find((s) => s.eventName === "FORMULA 1");
  const events = f1Scheduled?.events ?? [];

  return events.reduce(validateArray(eventValidator), [] as z.output<typeof eventValidator>[]);
};

const getDates = (event: Event) => {
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

const mapEventToRaceDetailsData = (event: Event, isReplay: boolean): RaceDetailsData => {
  const { startDate, endDate } = getDates(event);

  const [firstGenre] = event.metadata.genres;
  const isRace = isRaceGenre(firstGenre);

  return {
    title: event.metadata.titleBrief,
    id: String(event.metadata.contentId),
    pictureUrl: event.metadata.pictureUrl,
    isLive: event.metadata.contentSubtype === "LIVE",
    hasMedia: isReplay,
    description: isRace ? event.metadata.emfAttributes.Global_Title : event.metadata.title,
    contentId: event.metadata.contentId,
    countryName: event.metadata.emfAttributes.Meeting_Country_Name,
    countryId: event.metadata.emfAttributes.MeetingCountryKey,
    startDate,
    endDate,
    roundNumber: event.metadata.emfAttributes.Meeting_Number,
    isSingleEvent: false,
    genre: !isRace || event.metadata.emfAttributes.ContentCategory === "EPISODIC" ? "show" : firstGenre,
  };
};
