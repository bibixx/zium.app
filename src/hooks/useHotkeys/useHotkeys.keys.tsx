import { Key } from "ts-key-enum";

import { isWindows } from "../../utils/platform";
import { NDASH } from "../../utils/text";

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

export type BrandedKeyShortcut = { type: "keyShortcut"; keys: string[] };
export type BrandedCodeShortcut = { type: "codeShortcut"; codes: string[] };
export type BrandedShortcut = BrandedKeyShortcut | BrandedCodeShortcut;

const brandKeyShortcut = (keys: string[]): BrandedKeyShortcut => ({ type: "keyShortcut", keys });
const brandCodeShortcut = (codes: string[]): BrandedCodeShortcut => ({ type: "codeShortcut", codes });

export const SHORTCUTS = {
  // Races
  SEARCH_RACES: brandKeyShortcut(["/"]),

  // Viewer
  OPEN_LAYOUTS: brandKeyShortcut([Key.Shift, "n"]),
  PLAY_PAUSE: brandKeyShortcut(["space"]),
  BIG_SKIP_AHEAD: brandKeyShortcut([Key.ArrowRight]),
  SMALL_SKIP_AHEAD: brandKeyShortcut([Key.ArrowRight, CmdOrControl]),
  SUPER_SMALL_SKIP_AHEAD: brandKeyShortcut(["."]),
  BIG_SKIP_BACKWARDS: brandKeyShortcut([Key.ArrowLeft]),
  SMALL_SKIP_BACKWARDS: brandKeyShortcut([Key.ArrowLeft, CmdOrControl]),
  SUPER_SMALL_SKIP_BACKWARDS: brandKeyShortcut([","]),
  TOGGLE_FULL_SCREEN: brandKeyShortcut(["f"]),
  TOGGLE_CLOSED_CAPTIONS: brandKeyShortcut(["c"]),

  OFFSET_INPUT_INCREASE_SMALL: brandKeyShortcut([CmdOrControl, Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_MEDIUM: brandKeyShortcut([Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_BIG: brandKeyShortcut([Key.Shift, Key.ArrowUp]),
  OFFSET_INPUT_DECREASE_SMALL: brandKeyShortcut([CmdOrControl, Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_MEDIUM: brandKeyShortcut([Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_BIG: brandKeyShortcut([Key.Shift, Key.ArrowDown]),

  GRID_SMALL: brandKeyShortcut([Key.Shift, LEFT_CLICK]),
  GRID_PRECISE: brandKeyShortcut([CmdOrControl, LEFT_CLICK]),

  // Generic
  CLOSE: brandKeyShortcut([Key.Escape]),
  FOCUSED_VOLUME_DOWN: brandKeyShortcut([Key.ArrowLeft]),
  FOCUSED_VOLUME_UP: brandKeyShortcut([Key.ArrowRight]),
  TOGGLE_MUTE: brandKeyShortcut(["m"]),
  STREAM_PICKER_NEXT: brandKeyShortcut([Key.ArrowDown]),
  STREAM_PICKER_PREV: brandKeyShortcut([Key.ArrowUp]),
  STREAM_PICKER_SELECT: brandKeyShortcut([Key.Enter]),
  DEBUG: brandKeyShortcut([Key.Control, Key.Shift, "d"]),
  HELP: brandKeyShortcut([CmdOrControl, "?"]),

  SELECT_LAYOUT_1: brandCodeShortcut([Key.Alt, "Digit1"]),
  SELECT_LAYOUT_2: brandCodeShortcut([Key.Alt, "Digit2"]),
  SELECT_LAYOUT_3: brandCodeShortcut([Key.Alt, "Digit3"]),
  SELECT_LAYOUT_4: brandCodeShortcut([Key.Alt, "Digit4"]),
  SELECT_LAYOUT_5: brandCodeShortcut([Key.Alt, "Digit5"]),
  SELECT_LAYOUT_6: brandCodeShortcut([Key.Alt, "Digit6"]),
  SELECT_LAYOUT_7: brandCodeShortcut([Key.Alt, "Digit7"]),
  SELECT_LAYOUT_8: brandCodeShortcut([Key.Alt, "Digit8"]),
  SELECT_LAYOUT_9: brandCodeShortcut([Key.Alt, "Digit9"]),
  SELECT_LAYOUT_0: brandCodeShortcut([Key.Alt, "Digit0"]),
  SELECT_LAYOUT_GENERIC: brandCodeShortcut([Key.Alt, `1${NDASH}9`]),

  EASTER_EGG: brandKeyShortcut([Key.Shift, "s"]),
} satisfies Record<string, BrandedShortcut>;
