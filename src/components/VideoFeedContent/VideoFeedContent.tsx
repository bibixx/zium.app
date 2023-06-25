import { ReactNode } from "react";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { IconComponent } from "../../types/Icon";
import { DriverImage } from "../DriverImage/DriverImage";
import styles from "./VideoFeedContent.module.scss";

interface VideoFeedContentProps {
  label: ReactNode;
  srcList?: string[];
  icon?: IconComponent | null;
  topLabel?: ReactNode;
  showPlaceholder?: boolean;
}

export const VideoFeedContent = ({ label, srcList, icon: Icon, topLabel, showPlaceholder }: VideoFeedContentProps) => {
  return (
    <div className={styles.wrapper}>
      {srcList && (
        <div className={styles.imageWrapper}>
          <DriverImage srcList={srcList} />
        </div>
      )}
      {showPlaceholder && (
        <div className={styles.imageWrapper}>
          <SquaresPlusIcon height={24} width={24} />
        </div>
      )}
      {Icon && (
        <div className={styles.imageWrapper}>
          <Icon height={24} width={24} />
        </div>
      )}
      <div className={styles.textWrapper}>
        {topLabel && <div className={styles.topLabel}>{topLabel}</div>}
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
};
