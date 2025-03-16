import DriverTag from "../DriverTag/DriverTag";
import DriverDRS from "../DriverDRS/DriverDRS";
import DriverGap from "../DriverGap/DriverGap";
import DriverTire from "../DriverTire/DriverTire";
import DriverMiniSectors from "../DriverMiniSectors/DriverMiniSectors";
import DriverLapTime from "../DriverLapTime/DriverLapTime";
import DriverInfo from "../DriverInfo/DriverInfo";
import DriverCarMetrics from "../DriverCarMetrics/DriverCarMetrics";
import type { Driver, TimingDataDriver } from "../../types/state.type";
import { useDataStore, useCarDataStore } from "../../../../hooks/liveTiming/useStores/useDataStore";
import { useSettingsStore } from "../../../../hooks/liveTiming/useStores/useSettingsStore";
import styles from "./Driver.module.scss";

type Props = {
  position: number;
  driver: Driver;
  timingDriver: TimingDataDriver;
};

const hasDRS = (drs: number) => drs > 9;

const possibleDRS = (drs: number) => drs === 8;

const inDangerZone = (position: number, sessionPart: number) => {
  switch (sessionPart) {
    case 1:
      return position > 15;
    case 2:
      return position > 10;
    case 3:
    default:
      return false;
  }
};

export default function Driver({ driver, timingDriver, position }: Props) {
  const sessionPart = useDataStore((state) => state?.timingData?.sessionPart);
  const timingStatsDriver = useDataStore((state) => state?.timingStats?.lines[driver.racingNumber]);
  const appTimingDriver = useDataStore((state) => state?.timingAppData?.lines[driver.racingNumber]);
  const carData = useCarDataStore((state) =>
    state?.carsData ? state.carsData[driver.racingNumber].Channels : undefined,
  );

  const hasFastest = timingStatsDriver?.personalBestLapTime.position == 1;

  const carMetrics = useSettingsStore((state) => state.carMetrics);

  const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.racingNumber));

  const isInactive = timingDriver.knockedOut || timingDriver.retired || timingDriver.stopped;
  const isDanger = sessionPart != undefined && inDangerZone(position, sessionPart);

  const driverClasses = [
    styles.driver,
    isInactive && styles.inactive,
    favoriteDriver && styles.favorite,
    hasFastest && styles.fastest,
    isDanger && styles.danger,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={driverClasses}>
      <div className={styles.driverQueryContainer}>
        <div className={styles.driverContent}>
          <DriverTag id="tag" short={driver.tla} teamColor={driver.teamColour} position={position} />
          <DriverDRS
            id="drs"
            on={carData ? hasDRS(carData[45]) : false}
            possible={carData ? possibleDRS(carData[45]) : false}
            inPit={timingDriver.inPit}
            pitOut={timingDriver.pitOut}
          />
          <DriverTire id="tire" stints={appTimingDriver?.stints} />
          <DriverInfo
            id="info"
            timingDriver={timingDriver}
            gridPos={appTimingDriver ? parseInt(appTimingDriver.gridPos) : 0}
          />
          <DriverGap id="gap" timingDriver={timingDriver} sessionPart={sessionPart} />
          <DriverLapTime
            id="lap-time"
            last={timingDriver.lastLapTime}
            best={timingDriver.bestLapTime}
            hasFastest={hasFastest}
          />
          <DriverMiniSectors
            id="mini-sectors"
            sectors={timingDriver.sectors}
            bestSectors={timingStatsDriver?.bestSectors}
            tla={driver.tla}
          />

          {carMetrics && carData && <DriverCarMetrics id="car-metrics" carData={carData} />}
        </div>
      </div>
    </div>
  );
}
