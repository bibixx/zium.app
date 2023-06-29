import { RaceData } from "../hooks/useRacesList/useRacesList.types";

export const findEndingLastEvent = (races: RaceData[]) => {
  if (races.length === 0) {
    return null;
  }

  let latestEvent = races[0];

  for (let i = 1; i < races.length; i++) {
    const race = races[i];
    if (race.endDate > latestEvent.endDate) {
      latestEvent = race;
    }
  }

  return latestEvent;
};
