import { EventGenre } from "../../constants/races";
import { SupportedSeasons } from "../../constants/seasons";
import { Response } from "../../types/Response";

export interface RaceData {
  contentId: number;
  title: string;
  id: string | null;
  pictureUrl: string;
  countryName: string;
  startDate: Date;
  endDate: Date;
  roundNumber: number;
  description: string;
  countryId: string;
  isLive: boolean;
  isSingleEvent: boolean;
  hasMedia?: boolean;
  genre: EventGenre;
}

export type BaseRaces = { seasonId: SupportedSeasons };
export type RacesState = BaseRaces & Response<RaceData[]>;

export type RacesStateAction =
  | { type: "load"; seasonId: SupportedSeasons }
  | { type: "error"; error: Error; seasonId: SupportedSeasons }
  | { type: "done"; data: RaceData[]; seasonId: SupportedSeasons };
