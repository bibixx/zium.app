import { isValid } from "date-fns";
import { RaceData } from "../hooks/useRacesList/useRacesList.types";

export const findEndingLastEvent = (races: RaceData[], currentRaceId: string): RaceData | null => {
  if (races.length === 0) {
    return null;
  }

  let latestEvent = races[0];
  let areAllDatesInvalid = !isValid(latestEvent.endDate);

  for (let i = 1; i < races.length; i++) {
    const race = races[i];
    if (race.endDate > latestEvent.endDate) {
      latestEvent = race;
    }

    if (isValid(race.endDate)) {
      areAllDatesInvalid = false;
    }
  }

  if (areAllDatesInvalid) {
    return races.find((r) => r.id !== currentRaceId) ?? null;
  }

  return latestEvent;
};
