import cn from "classnames";
import { ReactNode } from "react";
import { withAs } from "../../utils/withAs";
import { ListItemWrapper } from "./ListItemWrapper/ListItemWrapper";
import styles from "./ListItem.module.scss";

interface ListItemProps {
  children: ReactNode;
  caption?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}

export const ListItem = withAs("button")<ListItemProps>((
  { as, children, caption, isActive = false, disabled, ...props },
  ref,
) => {
  return (
    <ListItemWrapper
      className={styles.listItemWrapper}
      isActive={isActive}
      as={as}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      <div className={cn(styles.contentWrapper)}>
        <div className={cn(styles.text, { [styles.isActive]: isActive })}>{children}</div>
        {caption && <div className={styles.caption}>{caption}</div>}
      </div>
    </ListItemWrapper>
  );
});
