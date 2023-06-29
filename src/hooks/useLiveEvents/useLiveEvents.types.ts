import { RaceData } from "../useRacesList/useRacesList.types";

interface LiveEventStateLoading {
  state: "loading";
}
interface LiveEventStateError {
  state: "error";
  error: Error;
}
interface LiveEventStateLoaded {
  state: "done";
  data: RaceData[];
}

export type LiveEventState = LiveEventStateLoading | LiveEventStateLoaded | LiveEventStateError;
