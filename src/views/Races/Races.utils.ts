import transliterate from "@sindresorhus/transliterate";
import { isSameDay } from "date-fns";
import moize from "moize";
import { RaceData, RacesState } from "../../hooks/useRacesList/useRacesList.types";
import { clone } from "../../utils/clone";

const unmemoizedPrepareForSearch = (text: string) => {
  return transliterate(text).toLowerCase();
};

export const prepareForSearch = moize.infinite(unmemoizedPrepareForSearch);

export const getLatestFinishedRaceData = (races: RaceData[]) => {
  const sortedRaces = clone(races).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  const latestFinishedRaceIndex = sortedRaces.findIndex((r) => r.endDate.getTime() <= Date.now());
  const latestFinishedRace = sortedRaces[latestFinishedRaceIndex];

  return { index: latestFinishedRaceIndex, race: latestFinishedRace, sortedRaces };
};

export const filterOutFutureRaces = (races: RaceData[]) => {
  const { race: latestFinishedRace, index: latestFinishedRaceIndex, sortedRaces } = getLatestFinishedRaceData(races);

  if (isSameDay(latestFinishedRace?.startDate, new Date())) {
    return sortedRaces.slice(latestFinishedRaceIndex);
  }

  return sortedRaces.slice(Math.max(0, latestFinishedRaceIndex - 1));
};

export const getWasSearchSuccessful = (seasonsList: RacesState[]) => {
  for (const season of seasonsList) {
    if (season.state !== "done") {
      return true;
    }

    if (season.data.length > 0) {
      return true;
    }
  }

  return false;
};
