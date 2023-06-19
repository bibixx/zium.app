import styles from "./KeyIndicator.module.scss";

interface KeyIndicatorProps {
  shortcut: string;
}

export const KeyIndicator = ({ shortcut }: KeyIndicatorProps) => {
  return <kbd className={styles.wrapper}>{shortcut}</kbd>;
};
