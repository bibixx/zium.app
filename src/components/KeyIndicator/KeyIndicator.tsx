import { Key } from "ts-key-enum";
import { toTitleCase } from "../../utils/text";
import styles from "./KeyIndicator.module.scss";

interface KeyIndicatorProps {
  shortcut: string;
}

export const KeyIndicator = ({ shortcut }: KeyIndicatorProps) => {
  return <kbd className={styles.wrapper}>{toHumanReadableKey(shortcut)}</kbd>;
};

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

  if (key === Key.Escape) {
    return "Esc";
  }

  return toTitleCase(key);
};
