import { useCallback, useEffect, useReducer } from "react";
import { EventGenre } from "../../constants/races";
import { Response, ResponseAction } from "../../types/Response";
import { fetchLiveTimingIndex } from "./useLiveTimingSession.api";
import { LiveTimingSessionMatch } from "./useLiveTimingSession.types";
import { matchLiveTimingSession } from "./useLiveTimingSession.utils";

type SessionMatchState = Response<LiveTimingSessionMatch>;
type SessionMatchAction = ResponseAction<LiveTimingSessionMatch>;

export const useLiveTimingSession = (season: number, startDate: Date, genre: EventGenre): SessionMatchState => {
  const [state, dispatch] = useReducer(
    (state: SessionMatchState, action: SessionMatchAction): SessionMatchState => {
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
      dispatch({ type: "load" });

      try {
        const index = await fetchLiveTimingIndex(season, signal);
        const match = matchLiveTimingSession(index, startDate, genre);

        if (match == null) {
          dispatch({
            type: "error",
            error: new Error(`No live timing data found for this session (${genre}, ${season})`),
          });
          return;
        }

        dispatch({ type: "done", data: match });
      } catch (error) {
        dispatch({ type: "error", error: error });
      }
    },
    [season, startDate, genre],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  return state;
};
