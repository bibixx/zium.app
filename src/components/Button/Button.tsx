import cn from "classnames";
import { ReactNode } from "react";
import { withAs } from "../../utils/withAs";
import { IconComponent } from "../../types/Icon";
import styles from "./Button.module.scss";

interface ButtonProps {
  children?: ReactNode;
  variant?: "Primary" | "Secondary" | "SecondaryInverted" | "Tertiary";
  size?: "Default" | "Action";
  fluid?: boolean;
  disabledState?: boolean;
  isPressed?: boolean;
  iconLeft?: IconComponent | null;
  iconRight?: IconComponent | null;
}

export const Button = withAs("button")<ButtonProps>((
  {
    as: Component,
    children,
    variant = "Primary",
    size = "Default",
    iconLeft: IconLeft,
    iconRight: IconRight,
    fluid = false,
    disabled = false,
    isPressed = false,
    disabledState = false,
    className,
    ...props
  },
  ref,
) => {
  return (
    <Component
      className={cn(
        styles.button,
        {
          [styles.primary]: variant === "Primary",
          [styles.secondary]: variant === "Secondary",
          [styles.secondaryInverted]: variant === "SecondaryInverted",
          [styles.tertiary]: variant === "Tertiary",
          [styles.action]: size === "Action",
          [styles.disabled]: disabled || disabledState,
          [styles.fluid]: fluid,
          [styles.isPressed]: isPressed,
        },
        className,
      )}
      ref={ref}
      disabled={disabled}
      aria-disabled={disabled || disabledState}
      {...props}
    >
      {IconLeft && (
        <div className={styles.iconWrapper}>
          <IconLeft width={20} height={20} />
        </div>
      )}
      {children && <div className={styles.content}>{children}</div>}
      {IconRight && (
        <div className={styles.iconWrapper}>
          <IconRight width={20} height={20} />
        </div>
      )}
    </Component>
  );
});
