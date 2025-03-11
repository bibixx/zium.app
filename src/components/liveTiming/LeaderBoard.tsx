import { useDataStore } from "../../hooks/liveTiming/useStores/useDataStore";
import { useSettingsStore } from "../../hooks/liveTiming/useStores/useSettingsStore";
import { objectEntries } from "../../utils/liveTiming/driverHelper";
import { sortPos } from "../../utils/liveTiming/sorting";
import styles from "./LeaderBoard.module.scss";
import Driver from "./driver/Driver";

export function LeaderBoard() {
  const drivers = useDataStore((state) => state?.driverList);
  const driversTiming = useDataStore((state) => state?.timingData);
  const showTableHeader = useSettingsStore((state) => state.tableHeaders);

  return (
    <div className={styles.leaderBoard}>
      {showTableHeader && <TableHeaders />}

      {(!drivers || !driversTiming) &&
        new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

      <div>
        {drivers && driversTiming && (
          <>
            {objectEntries(driversTiming.lines)
              .sort(sortPos)
              .map((timingDriver, index) => (
                <Driver
                  key={`leaderBoard.driver.${timingDriver.racingNumber}`}
                  position={index + 1}
                  driver={drivers[timingDriver.racingNumber]}
                  timingDriver={timingDriver}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}

const TableHeaders = () => {
  return (
    <div className={styles.leaderBoardHeaders}>
      <p>Position</p>
      <p>DRS</p>
      <p>Tire</p>
      <p>Info</p>
      <p>Gap</p>
      <p>LapTime</p>
      <p>Sectors</p>
    </div>
  );
};

const SkeletonDriver = () => {
  return (
    <div className={styles.skeletonDriver}>
      <div className={styles.skeletonItem} />

      <div className={`${styles.skeletonItem} ${styles.skeletonItemLargePartial}`} />

      <div className={styles.driverInfo}>
        <div className={`${styles.skeletonItem} ${styles.skeletonItemIcon}`} />

        <div className={styles.infoColumn}>
          <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall}`} />
          <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall} ${styles.skeletonItemPartial}`} />
        </div>
      </div>

      {new Array(2).fill(null).map((_, index) => (
        <div className={styles.infoColumn} key={`skeleton.${index}`}>
          <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall}`} />
          <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall} ${styles.skeletonItemPartial}`} />
        </div>
      ))}

      <div className={styles.infoColumn}>
        <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall} ${styles.skeletonItemLargePartial}`} />
        <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall}`} />
      </div>

      <div className={styles.sectorGroup}>
        {new Array(3).fill(null).map((_, index) => (
          <div className={styles.infoColumn} key={`skeleton.sector.${index}`}>
            <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall}`} />
            <div className={`${styles.skeletonItem} ${styles.skeletonItemSmall} ${styles.skeletonItemPartial}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
