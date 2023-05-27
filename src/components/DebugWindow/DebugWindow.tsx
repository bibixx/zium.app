import { useDebug } from "../../hooks/useDebug/useDebug";
import { useWindowSize } from "../../hooks/useWindowSize";
import styles from "./DebugWindow.module.scss";

export const DebugWindow = () => {
  const isDebugMode = useDebug();

  if (!isDebugMode) {
    return null;
  }

  return <RenderedDebugWindow />;
};

const RenderedDebugWindow = () => {
  const { width, height } = useWindowSize();

  return (
    <div className={styles.wrapper}>
      <div>
        {width}×{height}
      </div>
    </div>
  );
};
