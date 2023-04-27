import { RaceData } from "../useRacesList/useRacesList.types";

interface LiveEventStateLoading {
  state: "loading";
}
interface LiveEventStateLoaded {
  state: "done";
  data: LiveRaceData | null;
}

export type LiveEventState = LiveEventStateLoading | LiveEventStateLoaded;

export interface LiveRaceData extends RaceData {
  contentId: number;
}
