export interface RaceDetailsData {
  title: string;
  id: string;
}

export type RaceDetailsState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; data: RaceDetailsData[] };

export type RaceDetailsStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; data: RaceDetailsData[] };
