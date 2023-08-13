import {
  ChartBarIcon as ChartBarOutlineIcon,
  MapIcon as MapOutlineIcon,
  TvIcon as TvOutlineIcon,
  GlobeAltIcon as GlobeOutlineIcon,
} from "@heroicons/react/24/outline";
import {
  ChartBarIcon as ChartBarMiniIcon,
  MapIcon as MapMiniIcon,
  TvIcon as TvMiniIcon,
  GlobeAltIcon as GlobeMiniIcon,
} from "@heroicons/react/20/solid";
import {
  ChartBarIcon as ChartBarSolidIcon,
  MapIcon as MapSolidIcon,
  TvIcon as TvSolidIcon,
  GlobeAltIcon as GlobeSolidIcon,
} from "@heroicons/react/24/solid";
import { MainAndGlobalStreamInfo } from "../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { assertNever } from "./assertNever";

const icons = {
  outline: {
    tv: TvOutlineIcon,
    chartbar: ChartBarOutlineIcon,
    map: MapOutlineIcon,
    international: GlobeOutlineIcon,
  },
  solid: {
    tv: TvSolidIcon,
    chartbar: ChartBarSolidIcon,
    map: MapSolidIcon,
    international: GlobeSolidIcon,
  },
  mini: {
    tv: TvMiniIcon,
    chartbar: ChartBarMiniIcon,
    map: MapMiniIcon,
    international: GlobeMiniIcon,
  },
} as const;

export const getIconForStreamInfo = (
  streamType: MainAndGlobalStreamInfo["type"],
  type: "outline" | "solid" | "mini",
) => {
  switch (streamType) {
    case "f1live":
      return icons[type]["tv"];
    case "international":
      return icons[type]["international"];
    case "data-channel":
      return icons[type]["chartbar"];
    case "driver-tracker":
      return icons[type]["map"];
  }

  return assertNever(streamType);
};
