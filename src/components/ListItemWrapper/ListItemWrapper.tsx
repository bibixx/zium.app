import cn from "classnames";
import { ReactNode } from "react";
import styles from "./ListItemWrapper.module.scss";

interface ListItemWrapperProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}
export const ListItemWrapper = ({ children, className, isActive = false }: ListItemWrapperProps) => {
  return <button className={cn(styles.wrapper, { [styles.isActive]: isActive }, className)}>{children}</button>;
};
