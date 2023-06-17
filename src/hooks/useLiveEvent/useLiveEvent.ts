import { useCallback, useEffect, useState } from "react";
import { useRaceDetails } from "../useRaceDetails/useRaceDetails";
import { RaceDetailsData } from "../useRaceDetails/useRacesDetails.types";
import { fetchLiveEvent } from "./useLiveEvent.api";
import { LiveEventState } from "./useLiveEvent.types";

export const useLiveEvent = (fallbackRaceId: string | null): LiveEventState => {
  const [state, setState] = useState<LiveEventState>({ state: "loading" });
  const { racesDetailsState } = useRaceDetails(fallbackRaceId);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      const liveRace = await fetchLiveEvent(signal);
      setState({ state: "done", data: liveRace });
    } catch (error) {
      setState({ state: "error" });
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    fetchData(abortController.signal);
    const interval = setInterval(() => {
      fetchData(abortController.signal);
    }, 10_000);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, [fetchData]);

  const hasError = state.state === "error";
  const isDoneAndHasNoData = state.state === "done" && state.data === null;

  if (hasError || isDoneAndHasNoData) {
    if (racesDetailsState.state !== "done") {
      return {
        state: racesDetailsState.state,
      };
    }

    return {
      state: "done",
      data: findClosestToNow(racesDetailsState.data) ?? null,
    };
  }

  return state;
};

const findClosestToNow = (races: RaceDetailsData[]) => {
  let closestIndex = 0;
  let closestDiff = Infinity;

  const now = new Date();
  for (let i = 0; i < races.length; i++) {
    const race = races[i];

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
