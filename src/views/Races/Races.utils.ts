import transliterate from "@sindresorhus/transliterate";
import { add, differenceInDays, endOfDay, isSameDay, startOfDay } from "date-fns";
import moize from "moize";
import { RaceData, RacesState } from "../../hooks/useRacesList/useRacesList.types";
import { clone } from "../../utils/clone";
import { formatDateFull } from "../../utils/date";

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

  if (latestFinishedRaceIndex < 0) {
    return sortedRaces.slice(0, 1);
  }

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

export const searchRacePredicate = (transliteratedSearchQuery: string) => (race: RaceData) => {
  if (transliteratedSearchQuery === "") {
    return true;
  }

  const title = prepareForSearch(race.title);
  const description = prepareForSearch(race.description);
  const countryName = prepareForSearch(race.countryName);
  const sessionDuration = differenceInDays(endOfDay(race.endDate), startOfDay(race.startDate)) + 1;
  const searchFoundInDate = Array.from({ length: sessionDuration }).some((_, offset) =>
    prepareForSearch(formatDateFull(add(race.startDate, { days: offset }))).includes(transliteratedSearchQuery),
  );

  return (
    searchFoundInDate ||
    title.includes(transliteratedSearchQuery) ||
    description.includes(transliteratedSearchQuery) ||
    countryName.includes(transliteratedSearchQuery)
  );
};
