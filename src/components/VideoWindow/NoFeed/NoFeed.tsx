import { XMarkIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import closeButtonStyles from "../VideoWindow.module.scss";
import { Button } from "../../Button/Button";
import styles from "./NoFeed.module.scss";

interface NoFeedProps {
  children?: ReactNode;
  onDelete?: () => void;
}
export const NoFeed = ({ children, onDelete }: NoFeedProps) => {
  return (
    <VideoWindowWrapper className={closeButtonStyles.bitmovinWrapper}>
      <div className={styles.noFeedIconWrapper}>
        <EyeSlashIcon height={36} width={36} />
      </div>
      {children}
      {onDelete && (
        <div className={closeButtonStyles.closeButtonWrapper}>
          <Button variant="SecondaryInverted" onClick={onDelete} iconLeft={XMarkIcon} />
        </div>
      )}
    </VideoWindowWrapper>
  );
};
