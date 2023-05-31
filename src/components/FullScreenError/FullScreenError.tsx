import { BackgroundDots } from "../../views/Viewer/BackgroundDots/BackgroundDots";
import { useGrid } from "../../views/Viewer/hooks/useGrid";
import { ErrorMessage, ErrorMessageProps } from "../ErrorMessage/ErrorMessage";
import styles from "./FullScreenError.module.scss";

export const FullScreenError = (props: ErrorMessageProps) => {
  const { baseGrid } = useGrid();

  return (
    <div className={styles.screenWrapper}>
      <BackgroundDots baseGrid={baseGrid} />
      <div className={styles.wrapper}>
        <ErrorMessage {...props} />
      </div>
    </div>
  );
};
