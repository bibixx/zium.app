import { useCallback, useEffect, useReducer } from "react";
import { SupportedSeasons } from "../../constants/seasons";
import { fetchRacesList } from "./useRacesList.api";
import { RacesState, RacesStateAction } from "./useRacesList.types";

export const useRacesList = (seasonIds: SupportedSeasons[]) => {
  const [racesState, dispatch] = useReducer(
    (state: RacesState[], action: RacesStateAction): RacesState[] => {
      const { seasonId } = action;

      if (action.type === "load") {
        return replaceSeason(state, seasonId, { seasonId, state: "loading" });
      }

      if (action.type === "error") {
        return replaceSeason(state, seasonId, {
          seasonId,
          state: "error",
          error: action.error,
        });
      }

      if (action.type === "done") {
        return replaceSeason(state, seasonId, { seasonId, state: "done", data: action.data });
      }

      return state;
    },
    seasonIds.map((seasonId): RacesState => ({ seasonId, state: "loading" })),
  );

  const fetchData = useCallback(async (seasonId: SupportedSeasons, signal: AbortSignal) => {
    if (seasonId == null) {
      return;
    }

    dispatch({ seasonId, type: "load" });

    try {
      const newRaces = await fetchRacesList(seasonId, signal);

      dispatch({ type: "done", data: newRaces, seasonId });
    } catch (error) {
      console.error(error);
      dispatch({ type: "error", error: error as Error, seasonId });
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    seasonIds.forEach((seasonId) => {
      fetchData(seasonId, abortController.signal);
    });

    return () => abortController.abort();
  }, [fetchData, seasonIds]);

  return { racesState };
};

const replaceSeason = (seasons: RacesState[], seasonId: string, newValue: RacesState): RacesState[] =>
  seasons.map((season) => {
    if (season.seasonId !== seasonId) {
      return season;
    }

    return newValue;
  });
