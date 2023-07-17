import { BackgroundDots } from "../../views/Viewer/BackgroundDots/BackgroundDots";
import { useGrid } from "../../views/Viewer/hooks/useGrid";
import styles from "./NoViewerAccess.module.scss";

export const NoViewerAccess = () => {
  const { baseGrid } = useGrid();

  return (
    <div className={styles.screenWrapper}>
      <BackgroundDots baseGrid={baseGrid} />
      <div className={styles.wrapper}>You need F1 TV Pro</div>
    </div>
  );
};
