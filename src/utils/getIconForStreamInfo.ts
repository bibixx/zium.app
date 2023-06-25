import {
  ChartBarIcon as ChartBarOutlineIcon,
  MapIcon as MapOutlineIcon,
  TvIcon as TvOutlineIcon,
} from "@heroicons/react/24/outline";
import {
  ChartBarIcon as ChartBarMiniIcon,
  MapIcon as MapMiniIcon,
  TvIcon as TvMiniIcon,
} from "@heroicons/react/20/solid";
import {
  ChartBarIcon as ChartBarSolidIcon,
  MapIcon as MapSolidIcon,
  TvIcon as TvSolidIcon,
} from "@heroicons/react/24/solid";
import { StreamInfo } from "../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { assertNever } from "./assertNever";

const icons = {
  outline: {
    tv: TvOutlineIcon,
    chartbar: ChartBarOutlineIcon,
    map: MapOutlineIcon,
  },
  solid: {
    tv: TvSolidIcon,
    chartbar: ChartBarSolidIcon,
    map: MapSolidIcon,
  },
  mini: {
    tv: TvMiniIcon,
    chartbar: ChartBarMiniIcon,
    map: MapMiniIcon,
  },
} as const;

export const getIconForStreamInfo = (streamType: StreamInfo["type"], type: "outline" | "solid" | "mini") => {
  switch (streamType) {
    case "main":
      return icons[type]["tv"];
    case "data-channel":
      return icons[type]["chartbar"];
    case "driver-tracker":
      return icons[type]["map"];
    case "other":
      return icons[type]["tv"];
  }

  return assertNever(streamType);
};
