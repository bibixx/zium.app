export interface RaceDetailsData {
  title: string;
  id: string;
  pictureUrl: string;
  startDate: Date;
  isLive: boolean;
  hasMedia: boolean;
  description: string;

  contentId: number;
  countryName: string;
  endDate: Date;
  roundNumber: number;
  countryId: string;
}

export type RaceDetailsState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | { state: "done"; data: RaceDetailsData[] };

export type RaceDetailsStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | { type: "done"; data: RaceDetailsData[] };
