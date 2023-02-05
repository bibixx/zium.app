export interface RaceData {
  title: string;
  id: string;
}

export type RacesState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; data: RaceData[] };

export type RacesStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; data: RaceData[] };
