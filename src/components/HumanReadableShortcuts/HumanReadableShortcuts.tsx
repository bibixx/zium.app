import { Key } from "ts-key-enum";
import { CursorArrowRaysIcon } from "@heroicons/react/20/solid";
import { BrandedShortcut, LEFT_CLICK, MODIFIER_KEYS } from "../../hooks/useHotkeys/useHotkeys.keys";
import { joinReactNodes } from "../../utils/joinReactNodes";
import { KeyIndicator } from "../KeyIndicator/KeyIndicator";
import { isWindows } from "../../utils/platform";
import styles from "./HumanReadableShortcuts.module.scss";

interface HumanReadableShortcutsProps {
  keys: BrandedShortcut;
  withoutClick?: boolean;
}
export const HumanReadableShortcuts = ({ keys, withoutClick }: HumanReadableShortcutsProps) => {
  const shift = keys.includes(Key.Shift);
  const alt = keys.includes(Key.Alt);
  const control = keys.includes(Key.Control);
  const meta = keys.includes(Key.Meta);
  const leftClick = !withoutClick && keys.includes(LEFT_CLICK);

  const rest = keys.filter((key) => !MODIFIER_KEYS.includes(key));

  return (
    <span className={styles.wrapper}>
      {joinReactNodes(
        [
          control && <KeyIndicator key="ctrl" shortcut={"Ctrl"} />,
          meta && <KeyIndicator key="cmd" shortcut={"⌘"} />,
          alt && <KeyIndicator key="alt" shortcut={isWindows ? "Alt" : "⌥"} />,
          shift && <KeyIndicator key="shift" shortcut={"Shift"} />,
          ...rest.map((key) => <KeyIndicator key={key} shortcut={key} />),
          leftClick && <CursorArrowRaysIcon key="click" className={styles.icon} width={20} height={20} />,
        ].filter((el) => Boolean(el)),
        <span className={styles.plus}>+</span>,
      )}
    </span>
  );
};
