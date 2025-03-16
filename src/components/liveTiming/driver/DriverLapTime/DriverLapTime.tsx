import { TimingDataDriver } from "../../types/state.type";
import styles from "./DriverLapTime.module.scss";

type Props = {
  last: TimingDataDriver["lastLapTime"];
  best: TimingDataDriver["bestLapTime"];
  hasFastest: boolean;
  id?: string;
};

export default function DriverLapTime({ last, best, hasFastest, id }: Props) {
  const getTimeClasses = (isOverallFastest: boolean, isPersonalFastest: boolean, value: string | undefined) => {
    if (!value) return styles.empty;
    if (isOverallFastest) return styles.fastest;
    if (isPersonalFastest) return styles.personal;
    return "";
  };

  const lastClasses = [styles.last, getTimeClasses(last.overallFastest, last.personalFastest, last.value)]
    .filter(Boolean)
    .join(" ");

  const bestClasses = [styles.best, getTimeClasses(hasFastest, true, best.value)].filter(Boolean).join(" ");

  return (
    <div className={styles.lapTime} id={id}>
      <p className={lastClasses}>{last.value ? last.value : "-- -- ---"}</p>
      <p className={bestClasses}>{best.value ? best.value : "-- -- ---"}</p>
    </div>
  );
}
