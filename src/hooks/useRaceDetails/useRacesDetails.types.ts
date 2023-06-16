export interface RaceDetailsData {
  title: string;
  id: string;
  pictureUrl: string;
  isLive: boolean;
  hasMedia: boolean;
  description: string;

  contentId: number;
  countryName: string;
  startDate: Date;
  endDate: Date;
  // `| null` is needed for older races
  // startDate: Date | null;
  // endDate: Date | null;
  roundNumber: number;
  countryId: string;
  isSingleEvent: boolean;
}

export type RaceDetailsState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | { state: "done"; data: RaceDetailsData[] };

export type RaceDetailsStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | { type: "done"; data: RaceDetailsData[] };
