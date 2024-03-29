import { useState, useRef, useEffect, useCallback } from "react";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { useDropdownState } from "../../Dropdown/Dropdown.hooks";
import { Hotkey, useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";

const ALT_HOLD_TIP_DURATION = 500;
interface UseLayoutsDropdownStateArguments {
  loadLayout: (selectedLayoutIndex: number) => void;
}
export const useLayoutsDropdownState = ({ loadLayout }: UseLayoutsDropdownStateArguments) => {
  const { preventHiding } = useViewerUIVisibility();
  const onOpened = useCallback(() => preventHiding(true), [preventHiding]);
  const onClosed = useCallback(() => preventHiding(false), [preventHiding]);
  const dropdownState = useDropdownState({ onOpened, onClosed });

  const [withShortcutVisible, setWithShortcutVisible] = useState(false);

  const altTimeout = useRef<number | undefined>(undefined);
  useEffect(
    function openDropdownOnAlt() {
      const onKeyChange = (e: KeyboardEvent) => {
        if (!e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
          clearTimeout(altTimeout.current);
          setWithShortcutVisible(false);
          return;
        }

        if (dropdownState.isOpen) {
          setWithShortcutVisible(true);
          return;
        }

        altTimeout.current = setTimeout(() => {
          setWithShortcutVisible(true);
          dropdownState.setIsOpen(true);
        }, ALT_HOLD_TIP_DURATION);
      };

      document.addEventListener("keydown", onKeyChange);
      document.addEventListener("keyup", onKeyChange);

      return () => {
        document.removeEventListener("keydown", onKeyChange);
        document.removeEventListener("keyup", onKeyChange);
      };
    },
    [dropdownState],
  );

  useEffect(function cleanupOpenDropdownOnAlt() {
    return () => clearTimeout(altTimeout.current);
  }, []);

  const { setIsOpen: setIsDropdownOpen } = dropdownState;
  useHotkeys(() => {
    const layoutKeys = [
      SHORTCUTS.SELECT_LAYOUT_1,
      SHORTCUTS.SELECT_LAYOUT_2,
      SHORTCUTS.SELECT_LAYOUT_3,
      SHORTCUTS.SELECT_LAYOUT_4,
      SHORTCUTS.SELECT_LAYOUT_5,
      SHORTCUTS.SELECT_LAYOUT_6,
      SHORTCUTS.SELECT_LAYOUT_7,
      SHORTCUTS.SELECT_LAYOUT_8,
      SHORTCUTS.SELECT_LAYOUT_9,
      SHORTCUTS.SELECT_LAYOUT_0,
    ];

    return {
      id: "SelectLayout",
      allowPropagation: true,
      hotkeys: [
        ...layoutKeys.map((shortcut, i): Hotkey => {
          return {
            keys: shortcut,
            action: () => {
              loadLayout(i);
              setIsDropdownOpen(false);
              clearTimeout(altTimeout.current);
            },
            enabled: true,
          };
        }),
      ],
    };
  }, [loadLayout, setIsDropdownOpen]);

  return { dropdownState, withShortcutVisible };
};

type UseLayoutsDropdownHotkeysArguments = {
  isOpen: boolean;
  toggleOpen: () => void;
  withShortcutVisible: boolean;
};
export const useLayoutsDropdownHotkeys = ({
  isOpen,
  toggleOpen,
  withShortcutVisible,
}: UseLayoutsDropdownHotkeysArguments) => {
  useHotkeys(
    () => ({
      enabled: isOpen && !withShortcutVisible,
      allowPropagation: false,
      hotkeys: [
        {
          action: toggleOpen,
          keys: SHORTCUTS.CLOSE,
        },
      ],
    }),
    [isOpen, toggleOpen, withShortcutVisible],
  );
};
