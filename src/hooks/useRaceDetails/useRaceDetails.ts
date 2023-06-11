import { useCallback, useEffect, useReducer, useRef } from "react";
import { fetchRaceDetailsId } from "./useRaceDetails.api";
import { RaceDetailsState, RaceDetailsStateAction } from "./useRacesDetails.types";

export const useRaceDetails = (racePageId: string | null) => {
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const [racesDetailsState, dispatch] = useReducer(
    (state: RaceDetailsState, action: RaceDetailsStateAction): RaceDetailsState => {
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

  const fetchRaceEvents = useCallback(async () => {
    if (racePageId === null) {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    dispatch({ type: "load" });

    try {
      const newDetails = await fetchRaceDetailsId(racePageId, abortController.signal);

      abortControllerRef.current = undefined;
      dispatch({ type: "done", data: newDetails });
    } catch (error) {
      console.error(error);
      dispatch({ type: "error", error: error as Error });
    }
  }, [racePageId]);

  useEffect(() => {
    fetchRaceEvents();

    return () => abortControllerRef.current?.abort();
  }, [fetchRaceEvents, racePageId]);

  return {
    racesDetailsState,
    fetchRaceEvents,
  };
};
