import { TimingDataDriver } from "../../../types/liveTiming/types/state.type";
import styles from "./DriverInfo.module.scss";

type Props = {
  timingDriver: TimingDataDriver;
  gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
  const positionChange = gridPos && gridPos - parseInt(timingDriver.position);
  const gain = positionChange && positionChange > 0;
  const loss = positionChange && positionChange < 0;

  const status = timingDriver.knockedOut
    ? "OUT"
    : timingDriver.cutoff
    ? "CUTOFF"
    : timingDriver.retired
    ? "RETIRED"
    : timingDriver.stopped
    ? "STOPPED"
    : timingDriver.inPit
    ? "PIT"
    : timingDriver.pitOut
    ? "PIT OUT"
    : null;

  const positionClasses = [styles.position, gain ? styles.gain : loss ? styles.loss : styles.neutral].join(" ");

  return (
    <div className={styles.info} id="walkthrough-driver-info">
      <p className={positionClasses}>
        {positionChange !== undefined
          ? gain
            ? `+${positionChange}`
            : loss
            ? positionChange
            : "-"
          : `${timingDriver.numberOfLaps}L`}
      </p>

      <p className={styles.status}>{status ?? "-"}</p>
    </div>
  );
}
