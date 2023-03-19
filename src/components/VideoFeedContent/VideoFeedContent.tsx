import { ReactNode } from "react";
import styles from "./VideoFeedContent.module.scss";

interface VideoFeedContentProps {
  label: ReactNode;
  imageSrc?: string;
  topLabel?: ReactNode;
}

export const VideoFeedContent = ({ label, imageSrc, topLabel }: VideoFeedContentProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.imageWrapper}>
        <img src={imageSrc} alt="" draggable={false} />
      </div>
      <div className={styles.textWrapper}>
        {topLabel && <div className={styles.topLabel}>{topLabel}</div>}
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
};
