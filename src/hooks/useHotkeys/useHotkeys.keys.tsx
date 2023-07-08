import { Key } from "ts-key-enum";

import { isWindows } from "../../utils/platform";

export const CmdOrControl = isWindows ? Key.Control : Key.Meta;

export const mappedKeys: Record<string, string> = {
  escape: "esc",
  enter: "return",
  period: ".",
  comma: ",",
  slash: "-",
  space: " ",
  backquote: "`",
  backslash: "#",
  bracketright: "+",
  "?": "/",
};

export const LEFT_CLICK = "__LEFT_CLICK__";
export const MODIFIER_KEYS = [Key.Shift, Key.Alt, Key.Control, Key.Meta, LEFT_CLICK] as string[];

export type BrandedShortcut = string[] & { __type: "shortcut" };
const brandShortcut = (shortcut: string[]) => shortcut as BrandedShortcut;

export const SHORTCUTS = {
  // Races
  SEARCH_RACES: brandShortcut(["/"]),

  // Viewer
  OPEN_LAYOUTS: brandShortcut([Key.Shift, "n"]),
  PLAY_PAUSE: brandShortcut(["space"]),
  BIG_SKIP_AHEAD: brandShortcut([Key.ArrowRight]),
  SMALL_SKIP_AHEAD: brandShortcut([Key.ArrowRight, CmdOrControl]),
  BIG_SKIP_BACKWARDS: brandShortcut([Key.ArrowLeft]),
  SMALL_SKIP_BACKWARDS: brandShortcut([Key.ArrowLeft, CmdOrControl]),
  TOGGLE_FULL_SCREEN: brandShortcut(["f"]),
  TOGGLE_CLOSED_CAPTIONS: brandShortcut(["c"]),

  OFFSET_INPUT_INCREASE_SMALL: brandShortcut([CmdOrControl, Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_MEDIUM: brandShortcut([Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_BIG: brandShortcut([Key.Shift, Key.ArrowUp]),
  OFFSET_INPUT_DECREASE_SMALL: brandShortcut([CmdOrControl, Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_MEDIUM: brandShortcut([Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_BIG: brandShortcut([Key.Shift, Key.ArrowDown]),

  GRID_SMALL: brandShortcut([Key.Shift, LEFT_CLICK]),
  GRID_PRECISE: brandShortcut([CmdOrControl, LEFT_CLICK]),

  // Generic
  CLOSE: brandShortcut([Key.Escape]),
  FOCUSED_VOLUME_DOWN: brandShortcut([Key.ArrowLeft]),
  FOCUSED_VOLUME_UP: brandShortcut([Key.ArrowRight]),
  STREAM_PICKER_NEXT: brandShortcut([Key.ArrowDown]),
  STREAM_PICKER_PREV: brandShortcut([Key.ArrowUp]),
  STREAM_PICKER_SELECT: brandShortcut([Key.Enter]),
  DEBUG: brandShortcut([Key.Control, "d"]),
  HELP: brandShortcut([CmdOrControl, "?"]),

  EASTER_EGG: brandShortcut([Key.Shift, "s"]),
} satisfies Record<string, BrandedShortcut>;
