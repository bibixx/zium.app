import { Key } from "ts-key-enum";
import { isWindows } from "../../utils/platform";
import { KeyIndicator } from "../../components/KeyIndicator/KeyIndicator";
import { joinReactNodes } from "../../utils/joinReactNodes";
import { toTitleCase } from "../../utils/text";

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
};

export const MODIFIER_KEYS = [Key.Shift, Key.Alt, Key.Control, Key.Meta] as string[];

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

  OFFSET_INPUT_INCREASE_SMALL: brandShortcut([CmdOrControl, Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_MEDIUM: brandShortcut([Key.ArrowUp]),
  OFFSET_INPUT_INCREASE_BIG: brandShortcut([Key.Shift, Key.ArrowUp]),
  OFFSET_INPUT_DECREASE_SMALL: brandShortcut([CmdOrControl, Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_MEDIUM: brandShortcut([Key.ArrowDown]),
  OFFSET_INPUT_DECREASE_BIG: brandShortcut([Key.Shift, Key.ArrowDown]),

  GRID_SMALL: brandShortcut([Key.Shift]),
  GRID_PRECISE: brandShortcut([CmdOrControl]),

  // Generic
  CLOSE: brandShortcut([Key.Escape]),
  FOCUSED_VOLUME_DOWN: brandShortcut([Key.ArrowLeft]),
  FOCUSED_VOLUME_UP: brandShortcut([Key.ArrowRight]),
  STREAM_PICKER_NEXT: brandShortcut([Key.ArrowDown]),
  STREAM_PICKER_PREV: brandShortcut([Key.ArrowUp]),
  STREAM_PICKER_SELECT: brandShortcut([Key.Enter]),
  DEBUG: brandShortcut([Key.Control, "d"]),
} satisfies Record<string, BrandedShortcut>;

interface VisibleShortcut {
  shortcut: BrandedShortcut;
  label: string;
}
interface VisibleShortcutSection {
  label: string;
  shortcuts: VisibleShortcut[];
}
export const VISIBLE_SHORTCUTS: VisibleShortcutSection[] = [
  {
    label: "Races",
    shortcuts: [{ label: "Search races", shortcut: SHORTCUTS.SEARCH_RACES }],
  },
  {
    label: "Viewer",
    shortcuts: [
      { label: "Open layouts", shortcut: SHORTCUTS.OPEN_LAYOUTS },
      { label: "Play / Pause", shortcut: SHORTCUTS.PLAY_PAUSE },
      { label: "Big skip ahead", shortcut: SHORTCUTS.BIG_SKIP_AHEAD },
      { label: "Small skip ahead", shortcut: SHORTCUTS.SMALL_SKIP_AHEAD },
      { label: "Big skip backwards", shortcut: SHORTCUTS.BIG_SKIP_BACKWARDS },
      { label: "Small skip backwards", shortcut: SHORTCUTS.SMALL_SKIP_BACKWARDS },
      { label: "Toggle full screen", shortcut: SHORTCUTS.TOGGLE_FULL_SCREEN },

      { label: "Offset input increase small", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_SMALL },
      { label: "Offset input increase medium", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_MEDIUM },
      { label: "Offset input increase big", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_BIG },
      { label: "Offset input decrease small", shortcut: SHORTCUTS.OFFSET_INPUT_DECREASE_SMALL },
      { label: "Offset input decrease medium", shortcut: SHORTCUTS.OFFSET_INPUT_DECREASE_MEDIUM },
      { label: "Offset input decrease big", shortcut: SHORTCUTS.OFFSET_INPUT_DECREASE_BIG },

      { label: "Grid small", shortcut: SHORTCUTS.GRID_SMALL },
      { label: "Grid precise", shortcut: SHORTCUTS.GRID_PRECISE },
    ],
  },
  {
    label: "Generic",
    shortcuts: [
      { label: "Close", shortcut: SHORTCUTS.CLOSE },
      { label: "Focused volume down", shortcut: SHORTCUTS.FOCUSED_VOLUME_DOWN },
      { label: "Focused volume up", shortcut: SHORTCUTS.FOCUSED_VOLUME_UP },
      { label: "Stream picker next", shortcut: SHORTCUTS.STREAM_PICKER_NEXT },
      { label: "Stream picker prev", shortcut: SHORTCUTS.STREAM_PICKER_PREV },
      { label: "Stream picker select", shortcut: SHORTCUTS.STREAM_PICKER_SELECT },
      { label: "Debug", shortcut: SHORTCUTS.DEBUG },
    ],
  },
];

const toHumanReadableKey = (key: string) => {
  if (key === Key.ArrowUp) {
    return "↑";
  }

  if (key === Key.ArrowDown) {
    return "↓";
  }

  if (key === Key.ArrowLeft) {
    return "←";
  }

  if (key === Key.ArrowRight) {
    return "→";
  }

  return toTitleCase(key);
};

export function getNiceShortcutIndicator(keys: BrandedShortcut) {
  const shift = keys.includes(Key.Shift);
  const alt = keys.includes(Key.Alt);
  const control = keys.includes(Key.Control);
  const meta = keys.includes(Key.Meta);

  const rest = keys.filter((key) => !MODIFIER_KEYS.includes(key));

  return (
    <span>
      {joinReactNodes(
        [
          control && <KeyIndicator shortcut={"Ctrl"} />,
          meta && <KeyIndicator shortcut={"⌘"} />,
          alt && <KeyIndicator shortcut={isWindows ? "Alt" : "⌥"} />,
          shift && <KeyIndicator shortcut={"Shift"} />,
          ...rest.map((key) => <KeyIndicator key={key} shortcut={toHumanReadableKey(key)} />),
        ].filter((el) => Boolean(el)),
        <span> + </span>,
      )}
    </span>
  );
}
