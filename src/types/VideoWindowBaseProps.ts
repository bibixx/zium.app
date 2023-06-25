import { GridLayoutFillMode } from "../views/Viewer/hooks/useViewerState/useViewerState.utils";

export interface VideoWindowProps {
  isPaused: boolean;
  streamUrl: string | null;
  fillMode: GridLayoutFillMode;
  updateFillMode: (fillMode: GridLayoutFillMode) => void;
}
