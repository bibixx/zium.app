import { CodeBracketIcon, ComputerDesktopIcon, PlayCircleIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { IconComponent } from "../../types/Icon";
import { BrandedShortcut, SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";

interface VisibleShortcut {
  shortcut: BrandedShortcut;
  label: string;
}
interface VisibleShortcutSubSection {
  id: string;
  label?: string;
  shortcuts: VisibleShortcut[];
}
interface VisibleShortcutSection {
  id: string;
  label: string;
  icon?: IconComponent | null;
  sections: VisibleShortcutSubSection[];
}
export const VISIBLE_SHORTCUTS: VisibleShortcutSection[] = [
  {
    label: "General",
    id: "general",
    icon: ComputerDesktopIcon,
    sections: [
      {
        id: "general_root",
        shortcuts: [
          { label: "Close", shortcut: SHORTCUTS.CLOSE },
          { label: "Keyboard shortcuts", shortcut: SHORTCUTS.HELP },
        ],
      },
    ],
  },
  {
    label: "Browsing",
    id: "browsing",
    icon: Squares2X2Icon,
    sections: [
      {
        id: "browsing_root",
        shortcuts: [{ label: "Search races", shortcut: SHORTCUTS.SEARCH_RACES }],
      },
    ],
  },
  {
    label: "Watching",
    id: "watching",
    icon: PlayCircleIcon,
    sections: [
      {
        label: "General",
        id: "watching_general",
        shortcuts: [
          { label: "Open layouts", shortcut: SHORTCUTS.OPEN_LAYOUTS },
          { label: "Play / Pause", shortcut: SHORTCUTS.PLAY_PAUSE },
          { label: "Toggle full screen", shortcut: SHORTCUTS.TOGGLE_FULL_SCREEN },
          { label: "Toggle closed captions", shortcut: SHORTCUTS.TOGGLE_CLOSED_CAPTIONS },
          { label: "Precise resizing", shortcut: SHORTCUTS.GRID_SMALL },
          { label: "Freeform resizing", shortcut: SHORTCUTS.GRID_PRECISE },
        ],
      },
      {
        label: "Playback",
        id: "watching_playback",
        shortcuts: [
          { label: "Skip forward 30s", shortcut: SHORTCUTS.BIG_SKIP_AHEAD },
          { label: "Skip forward 10s", shortcut: SHORTCUTS.SMALL_SKIP_AHEAD },
          { label: "Skip backward 30s", shortcut: SHORTCUTS.BIG_SKIP_BACKWARDS },
          { label: "Skip backward 10s", shortcut: SHORTCUTS.SMALL_SKIP_BACKWARDS },
          { label: "Increase offset 1s", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_BIG },
          { label: "Increase offset 0.5s", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_MEDIUM },
          { label: "Increase offset 0.1s", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_SMALL },
          { label: "Decrease offset 1s", shortcut: SHORTCUTS.OFFSET_INPUT_INCREASE_BIG },
          { label: "Decrease offset 0.5s", shortcut: SHORTCUTS.OFFSET_INPUT_DECREASE_MEDIUM },
          { label: "Decrease offset 0.1s", shortcut: SHORTCUTS.OFFSET_INPUT_DECREASE_SMALL },
        ],
      },
    ],
  },
  {
    label: "Development",
    id: "development",
    icon: CodeBracketIcon,
    sections: [
      {
        id: "development_root",
        shortcuts: [
          { label: "Debug", shortcut: SHORTCUTS.DEBUG },
          { label: "???", shortcut: SHORTCUTS.EASTER_EGG },
        ],
      },
    ],
  },
];
