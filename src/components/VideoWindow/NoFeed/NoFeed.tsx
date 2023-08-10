import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { VideoWindowButtonsClose, VideoWindowButtonsTopRightWrapper } from "../VideoWindowButtons/VideoWindowButtons";
import styles from "./NoFeed.module.scss";

interface NoFeedProps {
  children?: ReactNode;
  onDelete?: () => void;
}
export const NoFeed = ({ children, onDelete }: NoFeedProps) => {
  return (
    <VideoWindowWrapper>
      <div className={styles.noFeedIconWrapper}>
        <EyeSlashIcon height={36} width={36} />
      </div>
      {children}
      {onDelete && (
        <VideoWindowButtonsTopRightWrapper>
          <VideoWindowButtonsClose onClose={onDelete} />
        </VideoWindowButtonsTopRightWrapper>
      )}
    </VideoWindowWrapper>
  );
};
