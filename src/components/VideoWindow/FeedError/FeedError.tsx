import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

import { VideoWindowButtonsClose, VideoWindowButtonsTopRightWrapper } from "../VideoWindowButtons/VideoWindowButtons";
import { ErrorMessage } from "../../ErrorMessage/ErrorMessage";
import styles from "./FeedError.module.scss";

interface FeedErrorProps {
  error: Error | unknown;
  onDelete?: () => void;
}
export const FeedError = ({ error, onDelete }: FeedErrorProps) => {
  return (
    <VideoWindowWrapper>
      <div className={styles.errorContent}>
        <div className={styles.errorContentWrapper}>
          <ErrorMessage error={error} />
        </div>
      </div>
      {onDelete && (
        <VideoWindowButtonsTopRightWrapper>
          <VideoWindowButtonsClose onClose={onDelete} />
        </VideoWindowButtonsTopRightWrapper>
      )}
    </VideoWindowWrapper>
  );
};
