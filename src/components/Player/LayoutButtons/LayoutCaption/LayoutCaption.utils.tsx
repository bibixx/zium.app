import { SHORTCUTS } from "../../../../hooks/useHotkeys/useHotkeys.keys";
import { HumanReadableShortcuts } from "../../../HumanReadableShortcuts/HumanReadableShortcuts";

export function getVideoShortcut(i: number) {
  if (i >= 10 || i < 0) {
    return null;
  }

  const shortcut = getShortcut((i + 1) % 10);
  if (shortcut == null) {
    return null;
  }

  return <HumanReadableShortcuts keys={shortcut} />;
}

export function getVideosText(videosCount: number) {
  if (videosCount === 1) {
    return `${videosCount} video`;
  }

  return `${videosCount} videos`;
}

function getShortcut(i: number) {
  if (i < 0 || i > 9) {
    return null;
  }

  type DigitString = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  const iAsString = String(i) as DigitString;
  return SHORTCUTS[`SELECT_LAYOUT_${iAsString}`];
}
