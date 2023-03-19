import classNames from "classnames";
import { ReactNode } from "react";
import styles from "./VideoWindowWrapper.module.scss";

interface VideoWindowWrapperProps {
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export const VideoWindowWrapper = ({ children, controls, className }: VideoWindowWrapperProps) => {
  return (
    <div className={classNames(styles.videoWindow, className)}>
      {children}
      {controls && (
        <div className={styles.controlsWrapper} onMouseDown={(e) => e.stopPropagation()}>
          {controls}
        </div>
      )}
    </div>
  );
};
