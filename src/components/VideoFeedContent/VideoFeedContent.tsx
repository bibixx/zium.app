import classNames from "classnames";
import { ReactNode } from "react";
import { useImage } from "react-image";
import styles from "./VideoFeedContent.module.scss";

interface VideoFeedContentProps {
  label: ReactNode;
  srcList?: string[];
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null;
  topLabel?: ReactNode;
}

export const VideoFeedContent = ({ label, srcList, icon: Icon, topLabel }: VideoFeedContentProps) => {
  return (
    <div className={styles.wrapper}>
      {srcList && (
        <div className={styles.imageWrapper}>
          <Img srcList={srcList} />
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
