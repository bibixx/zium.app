import { TvIcon } from "@heroicons/react/24/outline";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import cn from "classnames";
import styles from "./EventSession.module.scss";

interface EventSessionProps {
  title: string;
  subtitle: string;
  rightIconWrapperClassName?: string;
  isLive?: boolean;
  disabled?: boolean;
}
export const EventSession = ({
  title,
  subtitle,
  rightIconWrapperClassName,
  isLive = false,
  disabled = false,
}: EventSessionProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftIconWrapper}>
        <TvIcon width={24} height={24} stroke="currentColor" />
      </div>
      <div className={styles.textWrapper}>
        <div className={styles.title}>{title}</div>
        {!isLive && <div className={cn(styles.subtitle)}>{subtitle}</div>}
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
