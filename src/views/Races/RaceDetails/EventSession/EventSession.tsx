import { PlayCircleIcon } from "@heroicons/react/24/solid";
import cn from "classnames";
import { ReactNode } from "react";
import { IconComponent } from "../../../../types/Icon";
import styles from "./EventSession.module.scss";

interface EventSessionProps {
  title: string;
  subtitle: ReactNode;
  rightIconWrapperClassName?: string;
  isLive?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: IconComponent | null;
}
export const EventSession = ({
  title,
  subtitle,
  rightIconWrapperClassName,
  isLive = false,
  disabled = false,
  isLoading,
  icon: Icon,
}: EventSessionProps) => {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeletonLeftIcon}></div>
        <div className={styles.skeletonTextWrapper}>
          <div className={styles.skeletonFirstLine}></div>
          <div className={styles.skeletonSecondLine}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {Icon && (
        <div className={styles.leftIconWrapper}>
          <Icon width={24} height={24} />
        </div>
      )}
      <div className={styles.textWrapper}>
        <div className={styles.title}>{title}</div>
        {!isLive && subtitle && <div className={cn(styles.subtitle)}>{subtitle}</div>}
        {isLive && <div className={cn(styles.subtitle, styles.isLive)}>LIVE</div>}
      </div>
      {!disabled && (
        <div className={cn(styles.rightIconWrapper, rightIconWrapperClassName)}>
          <PlayCircleIcon width={24} height={24} fill="currentColor" />
        </div>
      )}
    </div>
  );
};
