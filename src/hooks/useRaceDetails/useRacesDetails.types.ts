export interface RaceDetailsData {
  title: string;
  id: string;
  pictureUrl: string;
  startDate: Date;
  isLive: boolean;
}

export type RaceDetailsState =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; data: RaceDetailsData[] };

export type RaceDetailsStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; data: RaceDetailsData[] };
