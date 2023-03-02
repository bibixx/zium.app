import cn from "classnames";
import { ReactNode } from "react";
import { withAs } from "../../utils/withAs";
import styles from "./ListItemWrapper.module.scss";

interface ListItemWrapperProps {
  children: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}
export const ListItemWrapper = withAs("button")<ListItemWrapperProps>(
  ({ as: Component, children, className, isActive = false, disabled, ...props }) => {
    return (
      <Component
        className={cn(styles.wrapper, { [styles.isActive]: isActive, [styles.disabled]: disabled }, className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
