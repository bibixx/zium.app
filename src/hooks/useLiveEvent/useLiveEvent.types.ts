import { RaceData } from "../useRacesList/useRacesList.types";

interface LiveEventStateLoading {
  state: "loading";
}
interface LiveEventStateError {
  state: "error";
}
interface LiveEventStateLoaded {
  state: "done";
  data: RaceData | null;
}

export type LiveEventState = LiveEventStateLoading | LiveEventStateLoaded | LiveEventStateError;
