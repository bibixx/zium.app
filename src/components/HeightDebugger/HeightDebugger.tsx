import { useWindowSize } from "../../hooks/useWindowSize";
import { CURRENT_STORE_VERSION, WindowGridState } from "../../utils/windowGridStore";
import styles from "./HeightDebugger.module.css";

export const HeightDebugger = () => {
  const { width, height } = useWindowSize();

  const restore219Backup = () => {
    localStorage.setItem("store", JSON.stringify(layout219));
    localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);
    window.location.reload();
  };

  const restoreBackup = (key: string) => {
    const bak = localStorage.getItem(key);

    if (bak) {
      localStorage.setItem("store", bak);
      localStorage.setItem("storeVersion", CURRENT_STORE_VERSION);
      window.location.reload();
    }
  };

  const storeBackup = (key: string) => {
    const s = localStorage.getItem("store");

    if (confirm("Are you sure?") && s) {
      localStorage.setItem(key, s);
    }
  };

  const onClear = () => {
    if (confirm("Are you sure?")) {
      localStorage.clear();
      window.location.reload();
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
          <button onClick={() => restore219Backup()}>Load</button>
          <button disabled>Save</button>
        </div>
        <div className={styles.buttonsWrapper}>
          <strong>#2</strong>
          <button disabled={!localStorage.getItem("store_bak1")} onClick={() => restoreBackup("store_bak1")}>
            Load
          </button>
          <button onClick={() => storeBackup("store_bak1")}>Save</button>
        </div>
        <div className={styles.buttonsWrapper}>
          <strong>#3</strong>
          <button disabled={!localStorage.getItem("store_bak1")} onClick={() => restoreBackup("store_bak2")}>
            Load
          </button>
          <button onClick={() => storeBackup("store_bak2")}>Save</button>
        </div>
      </div>
      <button onClick={onClear}>Clear localStorage</button>
    </div>
  );
};

const layout219: WindowGridState = {
  layout: [
    { width: 55.49967447916667, height: 76.49991461748868, x: 0, y: 0, id: "b1rfqr", zIndex: 6 },
    { width: 16.499837239583336, height: 23.5, x: 0, y: 76.5, id: "nlgk61", zIndex: 9 },
    { width: 17.999674161275223, height: 23.4990234375, x: 16.500323931376137, y: 76.5, id: "i1bglj", zIndex: 0 },
    { width: 22.499593098958336, height: 32.625, x: 55.500405629475914, y: 33.75, id: "jp4azy", zIndex: 8 },
    { width: 21.99951171875, height: 33.7490234375, x: 78.00024668375652, y: 0.0009765625, id: "3f7e9i", zIndex: 3 },
    { width: 21.999918619791668, height: 32.625, x: 77.99999872843425, y: 33.75, id: "ral762", zIndex: 2 },
    { width: 22.499593098958336, height: 33.75, x: 55.500405629475914, y: 0, id: "hp66b3", zIndex: 4 },
    { width: 22.499593098958336, height: 33.625, x: 55.500405629475914, y: 66.375, id: "1ziihg", zIndex: 7 },
    { width: 21.99951171875, height: 33.625, x: 77.99999872843425, y: 66.375, id: "u8dw0e", zIndex: 1 },
    { width: 20.999998728434242, height: 23.5, x: 34.50000127156576, y: 76.5, id: "u8dw0f", zIndex: 5 },
  ],
  windows: [
    { type: "main", id: "b1rfqr" },
    { type: "driver-tracker", id: "nlgk61" },
    { type: "data-channel", id: "i1bglj" },
    {
      type: "driver",
      id: "jp4azy",
      driverId: "VER",
    },
    {
      type: "driver",
      id: "3f7e9i",
      driverId: "PER",
    },
    {
      type: "driver",
      id: "ral762",
      driverId: "HAM",
    },
    {
      type: "driver",
      id: "hp66b3",
      driverId: "LEC",
    },
    {
      type: "driver",
      id: "1ziihg",
      driverId: "SAI",
    },
    {
      type: "driver",
      id: "u8dw0e",
      driverId: "RUS",
    },
    {
      type: "driver",
      id: "u8dw0f",
      driverId: "MAG",
    },
  ],
};
