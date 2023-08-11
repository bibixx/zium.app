import { Response } from "../../types/Response";
import { RaceData } from "../useRacesList/useRacesList.types";

export type HeaderCardDataState = Response<RaceData | null>;
