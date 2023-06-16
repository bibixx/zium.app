import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../Button/Button";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

import closeButtonStyles from "../VideoWindow.module.scss";
import styles from "./FeedError.module.scss";

interface FeedErrorProps {
  error: Error;
  onDelete?: () => void;
}
export const FeedError = ({ error, onDelete }: FeedErrorProps) => {
  return (
    <VideoWindowWrapper className={closeButtonStyles.bitmovinWrapper}>
      <div className={styles.errorContent}>
        <div className={styles.errorIconContainer}>
          <ExclamationCircleIcon height={36} width={36} />
        </div>
        <div>{error.message}</div>
      </div>
      {onDelete && (
        <div className={closeButtonStyles.closeButtonWrapper}>
          <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
        </div>
      )}
    </VideoWindowWrapper>
  );
};
