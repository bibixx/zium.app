import classNames from "classnames";
import { ReactNode } from "react";
import styles from "./VideoWindowWrapper.module.scss";

interface VideoWindowWrapperProps {
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
  hasOutline?: boolean;
}

export const VideoWindowWrapper = ({ children, controls, className, hasOutline }: VideoWindowWrapperProps) => {
  return (
    <div className={classNames(styles.videoWindow, className, { [styles.hasOutline]: hasOutline })}>
      {children}
      {controls && (
        <div className={styles.controlsWrapper} onMouseDown={(e) => e.stopPropagation()}>
          {controls}
        </div>
      )}
    </div>
  );
};
