export interface RaceDetailsData {
  title: string;
  id: string;
  pictureUrl: string;
  startDate: Date;
  isLive: boolean;
}

export type RaceDetailsState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | { state: "done"; data: RaceDetailsData[] };

export type RaceDetailsStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | { type: "done"; data: RaceDetailsData[] };
