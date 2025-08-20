import { PlaybackUrl } from "../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridLayoutFillMode } from "../views/Viewer/hooks/useViewerState/useViewerState.utils";

export interface VideoWindowProps {
  isPaused: boolean;
  streamUrl: PlaybackUrl | null;
  fillMode: GridLayoutFillMode;
  updateFillMode: (fillMode: GridLayoutFillMode) => void;
}
