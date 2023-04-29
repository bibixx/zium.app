import { useWindowSize } from "../../hooks/useWindowSize";
import styles from "./DebugWindow.module.scss";

export const DebugWindow = () => {
  const { width, height } = useWindowSize();

  return (
    <div className={styles.wrapper}>
      <div>
        {width}×{height}
      </div>
    </div>
  );
};
