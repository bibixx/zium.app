import { TvIcon } from "@heroicons/react/24/outline";
import {
  Practice1Icon,
  Practice2Icon,
  Practice3Icon,
  QualificationsIcon,
  RaceIcon,
  SprintIcon,
  SprintShootoutIcon,
} from "../../../components/CustomIcons/CustomIcons";
import { RaceDetailsData } from "../../../hooks/useRaceDetails/useRacesDetails.types";

const TvIconWithStroke = (props: React.SVGProps<SVGSVGElement>) => <TvIcon {...props} stroke="currentColor" />;

type RaceDetailsType =
  | "race"
  | "qualifying"
  | "practice 1"
  | "practice 2"
  | "practice 3"
  | "sprint qualifying"
  | "sprint race";
export const raceDetailsTypeToIconMap: Record<RaceDetailsType, React.FC> = {
  race: RaceIcon,
  qualifying: QualificationsIcon,
  "practice 1": Practice1Icon,
  "practice 2": Practice2Icon,
  "practice 3": Practice3Icon,
  "sprint qualifying": SprintShootoutIcon,
  "sprint race": SprintIcon,
};

export const getRaceIcon = (raceDetails: RaceDetailsData) => {
  switch (raceDetails.genre) {
    case "race":
    case "qualifying":
    case "sprint race": {
      return raceDetailsTypeToIconMap[raceDetails.genre];
    }
    case "sprint qualifying":
    case "sprint": {
      return raceDetailsTypeToIconMap["sprint qualifying"];
    }
    case "practice": {
      if (raceDetails.title.toLowerCase() === "practice 1") {
        return raceDetailsTypeToIconMap["practice 1"];
      }

      if (raceDetails.title.toLowerCase() === "practice 2") {
        return raceDetailsTypeToIconMap["practice 2"];
      }

      if (raceDetails.title.toLowerCase() === "practice 3") {
        return raceDetailsTypeToIconMap["practice 3"];
      }

      return TvIconWithStroke;
    }
    default: {
      return TvIconWithStroke;
    }
  }
};

export const adjustTitle = (title: string) => {
  if (title.toLowerCase() === "f1 sprint") {
    return "sprint";
  }

  return title;
};
