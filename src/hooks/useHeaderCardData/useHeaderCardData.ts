import { isRaceGenre } from "../../constants/races";
import { findEndingLastEvent } from "../../utils/findEndingLastEvent";
import { useLiveEvents } from "../useLiveEvents/useLiveEvents";
import { useRaceDetails } from "../useRaceDetails/useRaceDetails";
import { RaceDetailsData } from "../useRaceDetails/useRacesDetails.types";
import { HeaderCardDataState } from "./useHeaderCardData.types";

export const useHeaderCardData = (fallbackRaceId: string | null): HeaderCardDataState => {
  const liveEventsState = useLiveEvents(10_000);
  const { racesDetailsState } = useRaceDetails(fallbackRaceId);

  const hasError = liveEventsState.state === "error";
  const isDoneAndHasNoData = liveEventsState.state === "done" && liveEventsState.data.length === 0;

  if (hasError || isDoneAndHasNoData) {
    if (racesDetailsState.state !== "done") {
      return racesDetailsState;
    }

    return {
      state: "done",
      data: findClosestToNow(racesDetailsState.data) ?? null,
    };
  }

  if (liveEventsState.state === "loading") {
    return {
      state: "loading",
    };
  }

  return {
    state: "done",
    data: findEndingLastEvent(liveEventsState.data),
  };
};

const findClosestToNow = (races: RaceDetailsData[]) => {
  let closestIndex = 0;
  let closestDiff = Infinity;

  const now = new Date();
  for (let i = 0; i < races.length; i++) {
    const race = races[i];

    if (!isRaceGenre(race.genre)) {
      continue;
    }

    if (race.isLive) {
      return race;
    }

    const compareDate = race.hasMedia ? race.endDate : race.startDate;
    const diff = Math.abs(now.getTime() - compareDate.getTime());
    if (diff < closestDiff) {
      closestIndex = i;
      closestDiff = diff;
    }
  }

  return races[closestIndex];
};
