import { useState, RefCallback, useCallback, useMemo, useEffect } from "react";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";

export const usePopperAnchorRef = <T>(initialValue: T) => {
  const [element, setElement] = useState<T>(initialValue);

  const updateRef: RefCallback<T> = useCallback((ref: T) => {
    setElement(ref);
  }, []);

  const ref = useMemo(
    () => ({
      current: element,
    }),
    [element],
  );

  return { updateRef, ref, element };
};

export type UseDropdownStateArguments = {
  onOpened?: () => void;
  onClosed?: () => void;
};
export const useDropdownState = ({ onClosed, onOpened }: UseDropdownStateArguments) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((oldIsOpen) => !oldIsOpen), []);

  useEffect(() => {
    if (isOpen) {
      onOpened?.();
    } else {
      onClosed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return { isOpen, setIsOpen, toggleOpen };
};

type UseDropdownHotkeysArguments = { isOpen: boolean; toggleOpen: () => void };
export const useDropdownHotkeys = ({ isOpen, toggleOpen }: UseDropdownHotkeysArguments) => {
  useHotkeys(
    () => ({
      enabled: isOpen,
      allowPropagation: false,
      hotkeys: [
        {
          action: toggleOpen,
          keys: SHORTCUTS.CLOSE,
        },
      ],
    }),
    [isOpen, toggleOpen],
  );
};
