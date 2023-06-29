import { RaceData } from "../useRacesList/useRacesList.types";

export type HeaderCardDataState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | { state: "done"; data: RaceData | null };
