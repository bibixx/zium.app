import classNames from "classnames";
import { ReactNode } from "react";
import { useImage } from "react-image";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import { IconComponent } from "../../types/Icon";
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
          <Img srcList={srcList} />
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

interface ImgProps {
  srcList: string[];
}
const Img = ({ srcList }: ImgProps) => {
  const { src, isLoading } = useImage({
    srcList,
    useSuspense: false,
  });

  return (
    <img src={src} alt="" draggable={false} className={classNames(styles.image, { [styles.isLoading]: isLoading })} />
  );
};
