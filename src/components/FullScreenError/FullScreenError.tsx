import { BackgroundCards } from "../../views/Viewer/BackgroundCards/BackgroundCards";
import { ErrorMessage, ErrorMessageProps } from "../ErrorMessage/ErrorMessage";
import styles from "./FullScreenError.module.scss";

export const FullScreenError = (props: ErrorMessageProps) => {
  return (
    <div className={styles.screenWrapper}>
      <BackgroundCards />
      <div className={styles.wrapper}>
        <ErrorMessage {...props} />
      </div>
    </div>
  );
};
