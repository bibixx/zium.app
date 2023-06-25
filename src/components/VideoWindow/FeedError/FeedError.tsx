import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

import { VideoWindowButtons } from "../VideoWindowButtons/VideoWindowButtons";
import styles from "./FeedError.module.scss";

interface FeedErrorProps {
  error: Error;
  onDelete?: () => void;
}
export const FeedError = ({ error, onDelete }: FeedErrorProps) => {
  return (
    <VideoWindowWrapper>
      <div className={styles.errorContent}>
        <div className={styles.errorIconContainer}>
          <ExclamationCircleIcon height={36} width={36} />
        </div>
        <div>{error.message}</div>
      </div>
      <VideoWindowButtons onClose={onDelete} />
    </VideoWindowWrapper>
  );
};
