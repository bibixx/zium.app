import { ReactNode } from "react";
import styles from "./VideoWindowWrapper.module.scss";

interface VideoWindowWrapperProps {
  children: ReactNode;
}

export const VideoWindowWrapper = ({ children }: VideoWindowWrapperProps) => {
  return <div className={styles.videoWindow}>{children}</div>;
};
