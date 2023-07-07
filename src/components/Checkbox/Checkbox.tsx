import { CheckIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import styles from "./Checkbox.module.scss";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
}
export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => (
  <label className={styles.checkboxRow}>
    <input
      className={styles.checkboxInput}
      type="checkbox"
      onChange={(e) => onChange(e.target.checked)}
      checked={checked}
    />
    <div className={cn(styles.checkboxButton, { [styles.isActive]: checked })}>
      {checked && <CheckIcon height={16} width={16} />}
    </div>
    <span className={styles.textLabel}>{label}</span>
  </label>
);
