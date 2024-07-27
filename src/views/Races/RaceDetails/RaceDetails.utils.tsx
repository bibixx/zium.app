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
import { IconComponent } from "../../../types/Icon";

const TvIconWithStroke: IconComponent = (props) => <TvIcon {...props} stroke="currentColor" />;

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

export const getRaceIcon = (raceDetails: RaceDetailsData, seasonId: string) => {
  const seasonIdAsNumber = Number.parseInt(seasonId, 10);

  switch (raceDetails.genre) {
    case "race":
    case "qualifying": {
      return raceDetailsTypeToIconMap[raceDetails.genre];
    }
    case "sprint race":
    case "sprint qualifying":
    case "sprint": {
      if (raceDetails.genre === "sprint qualifying" && seasonIdAsNumber < 2023) {
        return raceDetailsTypeToIconMap["sprint race"];
      }
      if (raceDetails.genre === "sprint") {
        return raceDetailsTypeToIconMap["sprint race"];
      }

      if (raceDetails.genre === "sprint race") {
        return raceDetailsTypeToIconMap[raceDetails.genre];
      }

      return raceDetailsTypeToIconMap["sprint qualifying"];
    }
    case "practice": {
      const adjustedTitle = adjustTitle(raceDetails.title, raceDetails.isLive);

      if (adjustedTitle.toLowerCase().includes("practice 1")) {
        return raceDetailsTypeToIconMap["practice 1"];
      }

      if (adjustedTitle.toLowerCase().includes("practice 2")) {
        return raceDetailsTypeToIconMap["practice 2"];
      }

      if (adjustedTitle.toLowerCase().includes("practice 3")) {
        return raceDetailsTypeToIconMap["practice 3"];
      }

      if (adjustedTitle.toLowerCase().includes("practice")) {
        return raceDetailsTypeToIconMap["practice 1"];
      }

      return TvIconWithStroke;
    }
    default: {
      return TvIconWithStroke;
    }
  }
};

export const adjustTitle = (title: string, isLive: boolean) => {
  if (title.toLowerCase() === "f1 sprint") {
    return "sprint";
  }

  if (!isLive) {
    return title.replace(/ replay$/i, "");
  }

  return title;
};
