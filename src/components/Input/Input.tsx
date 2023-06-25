import { XCircleIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { forwardRef, useRef } from "react";
import { KeyIndicator } from "../KeyIndicator/KeyIndicator";
import { IconComponent } from "../../types/Icon";
import styles from "./Input.module.scss";

interface InputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  icon?: IconComponent | null;
  isRounded?: boolean;
  canClear?: boolean;
  onChange?: (value: string, e?: React.ChangeEvent) => void;
  shortcut?: string;
  labelClassName?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, icon: Icon, isRounded = false, canClear = false, onChange, value, shortcut, labelClassName, ...props },
    ref,
  ) => {
    const isInputEmpty = value === "" || value === undefined;
    const inputFallbackRef = useRef<HTMLInputElement>(null);

    return (
      <div className={styles.wrapper}>
        <label className={cn(styles.label, { [styles.isRounded]: isRounded }, labelClassName)}>
          {Icon && (
            <div className={styles.iconWrapper}>
              <Icon width={20} height={20} fill="currentColor" />
            </div>
          )}
          <input
            {...props}
            className={cn(styles.input, className)}
            value={value}
            onChange={(e) => onChange?.(e.target.value, e)}
            ref={ref ?? inputFallbackRef}
          />
          {Boolean(shortcut || canClear) && (
            <div className={styles.rightButtonsWrapper}>
              {shortcut && (
                <div className={styles.shortcutPlaceholder}>
                  <KeyIndicator shortcut={shortcut} />
                </div>
              )}
              {canClear && <div className={styles.closeWrapperPlaceholder} />}
            </div>
          )}
        </label>
        <div className={cn(styles.rightButtonsWrapper, styles.isAbsolute)}>
          {canClear && (
            <button
              className={cn(styles.closeWrapper, { [styles.isVisible]: !isInputEmpty })}
              onClick={() => {
                const inputRef = ref ?? inputFallbackRef;
                if (inputRef !== null && typeof inputRef !== "function") {
                  inputRef.current?.focus();
                }

                onChange?.("");
              }}
              aria-hidden={!isInputEmpty}
            >
              <XCircleIcon width={20} height={20} fill="currentColor" />
            </button>
          )}
          {shortcut && <KeyIndicator shortcut={shortcut} />}
        </div>
      </div>
    );
  },
);
