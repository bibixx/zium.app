export interface RaceData {
  title: string;
  id: string;
  pictureUrl: string;
  countryName: string;
  startDate: Date;
  endDate: Date;
  roundNumber: number;
  description: string;
  countryId: string;
}

export type RacesState = { state: "loading" } | { state: "error"; error: Error } | { state: "done"; data: RaceData[] };

export type RacesStateAction = { type: "load" } | { type: "error"; error: Error } | { type: "done"; data: RaceData[] };
