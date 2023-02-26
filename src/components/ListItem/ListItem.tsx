import cn from "classnames";
import { ReactNode } from "react";
import { ListItemWrapper } from "../ListItemWrapper/ListItemWrapper";
import styles from "./ListItem.module.scss";

interface ListItemProps {
  children: ReactNode;
  caption?: ReactNode;
  isActive?: boolean;
}
export const ListItem = ({ children, caption, isActive = false }: ListItemProps) => {
  return (
    <ListItemWrapper className={styles.listItemWrapper} isActive={isActive}>
      <div className={cn(styles.contentWrapper)}>
        <div className={cn(styles.text, { [styles.isActive]: isActive })}>{children}</div>
        {caption && <div className={styles.caption}>{caption}</div>}
      </div>
    </ListItemWrapper>
  );
};
