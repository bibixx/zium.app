import cn from "classnames";
import { ReactNode } from "react";
import { withAs } from "../../utils/withAs";
import styles from "./Button.module.scss";

interface ButtonProps {
  children?: ReactNode;
  variant?: "Primary" | "Secondary" | "SecondaryInverted" | "Tertiary";
  fluid?: boolean;
  disabledState?: boolean;
  iconLeft?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null;
  iconRight?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null;
}

export const Button = withAs("button")<ButtonProps>(
  ({
    as: Component,
    children,
    variant = "Primary",
    iconLeft: IconLeft,
    iconRight: IconRight,
    fluid = false,
    disabled = false,
    disabledState = false,
    ...props
  }) => {
    return (
      <Component
        className={cn(styles.button, {
          [styles.primary]: variant === "Primary",
          [styles.secondary]: variant === "Secondary",
          [styles.secondaryInverted]: variant === "SecondaryInverted",
          [styles.tertiary]: variant === "Tertiary",
          [styles.disabled]: disabled || disabledState,
          [styles.fluid]: fluid,
        })}
        {...props}
      >
        {IconLeft && (
          <div className={styles.iconWrapper}>
            <IconLeft width={20} height={20} fill="currentColor" />
          </div>
        )}
        {children && <div className={styles.content}>{children}</div>}
        {IconRight && (
          <div className={styles.iconWrapper}>
            <IconRight width={20} height={20} fill="currentColor" />
          </div>
        )}
      </Component>
    );
  },
);
