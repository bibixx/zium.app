import { useCallback, useState } from "react";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import { HumanReadableShortcuts } from "../HumanReadableShortcuts/HumanReadableShortcuts";
import { Sheet } from "../Sheet/Sheet";
import { VISIBLE_SHORTCUTS } from "./ShortcutsSnackbar.constant";
import styles from "./ShortcutsSnackbar.module.scss";

interface ShortcutsSnackbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsSnackbar = ({ onClose, isOpen }: ShortcutsSnackbarProps) => {
  useHotkeys(
    () => ({
      id: "ShortcutsSnackbar",
      enabled: isOpen,
      allowPropagation: false,
      hotkeys: [
        {
          keys: SHORTCUTS.HELP,
          action: onClose,
        },
        {
          keys: SHORTCUTS.CLOSE,
          action: onClose,
        },
      ],
    }),
    [isOpen, onClose],
  );

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.section}>
        <div className={styles.sheetHeader}>Keyboard shortcuts</div>
      </div>
      {VISIBLE_SHORTCUTS.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.id} className={styles.section}>
            <div className={styles.sectionHeaderWrapper}>
              {Icon && (
                <div className={styles.sectionIcon}>
                  <Icon width={24} height={24} />
                </div>
              )}
              <div className={styles.sectionHeader}>{section.label}</div>
            </div>
            <div className={styles.sectionContent}>
              {section.sections.map((subsection) => (
                <div className={styles.subSection} key={subsection.id}>
                  {subsection.label && <div className={styles.subSectionHeader}>{subsection.label}</div>}
                  {subsection.shortcuts.map((shortcut) => (
                    <div key={shortcut.label} className={styles.shortcutRow}>
                      <div className={styles.shortcutRowText}>{shortcut.label}</div>
                      <div>
                        <HumanReadableShortcuts keys={shortcut.shortcut} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Sheet>
  );
};

export const GlobalShortcutsSnackbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys(
    () => ({
      id: "GlobalShortcutsSnackbar",
      allowPropagation: true,
      hotkeys: [
        {
          keys: SHORTCUTS.HELP,
          action: () => setIsOpen(true),
        },
      ],
    }),
    [],
  );

  const onClose = useCallback(() => setIsOpen(false), []);
  return <ShortcutsSnackbar isOpen={isOpen} onClose={onClose} />;
};
