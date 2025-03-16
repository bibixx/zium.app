import { TimingDataDriver } from "../../types/state.type";
import styles from "./DriverGap.module.scss";

type Props = {
  timingDriver: TimingDataDriver;
  sessionPart: number | undefined;
  id?: string;
};

export default function DriverGap({ timingDriver, sessionPart, id }: Props) {
  const gapToLeader =
    timingDriver.gapToLeader ??
    (timingDriver.stats ? timingDriver.stats[sessionPart ? sessionPart - 1 : 0].timeDiffToFastest : undefined) ??
    timingDriver.timeDiffToFastest ??
    "";

  const gapToFront =
    timingDriver.intervalToPositionAhead?.value ??
    (timingDriver.stats ? timingDriver.stats[sessionPart ? sessionPart - 1 : 0].timeDifftoPositionAhead : undefined) ??
    timingDriver.timeDiffToPositionAhead ??
    "";

  const catching = timingDriver.intervalToPositionAhead?.catching;

  const frontClasses = [styles.front, catching ? styles.catching : !gapToFront ? styles.empty : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.gap} id={id}>
      <p className={frontClasses}>{gapToFront ? gapToFront : "-- ---"}</p>
      <p className={styles.leader}>{gapToLeader ? gapToLeader : "-- ---"}</p>
    </div>
  );
}
