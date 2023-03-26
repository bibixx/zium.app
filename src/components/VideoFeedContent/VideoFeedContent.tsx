import { ReactNode } from "react";
import { useImage } from "react-image";
import styles from "./VideoFeedContent.module.scss";

interface VideoFeedContentProps {
  label: ReactNode;
  srcList: string[];
  topLabel?: ReactNode;
}

export const VideoFeedContent = ({ label, srcList, topLabel }: VideoFeedContentProps) => {
  const { src } = useImage({
    srcList,
    useSuspense: false,
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.imageWrapper}>
        <img src={src} alt="" draggable={false} />
      </div>
      <div className={styles.textWrapper}>
        {topLabel && <div className={styles.topLabel}>{topLabel}</div>}
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
};
