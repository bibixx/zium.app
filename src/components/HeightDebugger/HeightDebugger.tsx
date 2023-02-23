import { useWindowSize } from "../../hooks/useWindowSize";
import styles from "./HeightDebugger.module.css";

export const HeightDebugger = () => {
  const { width, height } = useWindowSize();

  const restoreBackup = (key: string) => {
    const bak = localStorage.getItem(key);

    if (bak) {
      localStorage.setItem("store", bak);
      window.location.reload();
    }
  };

  const storeBackup = (key: string) => {
    const s = localStorage.getItem("store");

    if (confirm("Are you sure?") && s) {
      localStorage.setItem(key, s);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div>
        {width}×{height}
      </div>
      <div className={styles.allButtonsWrapper}>
        <div className={styles.buttonsWrapper}>
          <strong>#1</strong>
          <button onClick={() => restoreBackup("store_bak1")}>Load</button>
          <button onClick={() => storeBackup("store_bak1")}>Save</button>
        </div>
        <div className={styles.buttonsWrapper}>
          <strong>#2</strong>
          <button onClick={() => restoreBackup("store_bak2")}>Load</button>
          <button onClick={() => storeBackup("store_bak2")}>Save</button>
        </div>
      </div>
    </div>
  );
};
