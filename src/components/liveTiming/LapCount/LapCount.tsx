import cn from "classnames";
import { useDataStore } from "../../../hooks/liveTiming/useStores/useDataStore";
import styles from "./LapCount.module.scss";

export default function LapCount() {
  const lapCount = useDataStore((state) => state.lapCount);

  if (lapCount == null) {
    return null;
  }

  return (
    <div className={cn(styles.lapCount)}>
      {lapCount?.currentLap} / {lapCount?.totalLaps}
    </div>
  );
}
