import { Response } from "../../types/Response";
import { RaceData } from "../useRacesList/useRacesList.types";

export type LiveEventState = Response<RaceData[]>;
