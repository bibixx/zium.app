import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

import { VideoWindowButtons } from "../VideoWindowButtons/VideoWindowButtons";
import { ErrorMessage } from "../../ErrorMessage/ErrorMessage";
import styles from "./FeedError.module.scss";

interface FeedErrorProps {
  error: Error;
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
      <VideoWindowButtons onClose={onDelete} />
    </VideoWindowWrapper>
  );
};
