import { useCallback, useEffect, useReducer } from "react";
import { fetchRacesList } from "./useRacesList.api";
import { RacesState, RacesStateAction } from "./useRacesList.types";

export const useRacesList = (seasonId: string) => {
  const [racesState, dispatch] = useReducer(
    (state: RacesState, action: RacesStateAction): RacesState => {
      if (action.type === "load") {
        return { state: "loading" };
      }

      if (action.type === "error") {
        return { state: "error", error: action.error };
      }

      if (action.type === "done") {
        return { state: "done", data: action.data };
      }

      return state;
    },
    { state: "loading" },
  );

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      if (seasonId == null) {
        return;
      }

      dispatch({ type: "load" });

      try {
        const newRaces = await fetchRacesList(seasonId, signal);

        dispatch({ type: "done", data: newRaces });
      } catch (error) {
        console.error(error);
        dispatch({ type: "error", error: (error as Error).message });
      }
    },
    [seasonId],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  return { racesState };
};
