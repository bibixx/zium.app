import { XCircleIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { forwardRef, useRef } from "react";
import styles from "./Input.module.scss";

interface InputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null;
  isRounded?: boolean;
  canClear?: boolean;
  onChange?: (value: string, e?: React.ChangeEvent) => void;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, isRounded = false, canClear = false, onChange, value, ...props }, ref) => {
    const isInputEmpty = value === "" || value === undefined;
    const inputFallbackRef = useRef<HTMLInputElement>(null);

    return (
      <div className={styles.wrapper}>
        <label className={cn(styles.label, { [styles.isRounded]: isRounded })}>
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
          {canClear && <div className={styles.closeWrapperPlaceholder} />}
        </label>
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
      </div>
    );
  },
);
