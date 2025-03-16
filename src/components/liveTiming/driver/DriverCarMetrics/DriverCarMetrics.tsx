import { useSettingsStore } from "../../../../hooks/liveTiming/useStores/useSettingsStore";
import { CarDataChannels } from "../../types/state.type";
import DriverPedals from "../DriverPedals/DriverPedals";
import styles from "./DriverCarMetrics.module.scss";

type Props = {
  carData: CarDataChannels;
  id?: string;
};

const convertKmhToMph = (kmh: number) => Math.round(kmh * 0.621371);

export default function DriverCarMetrics({ carData, id }: Props) {
  const speedUnit = useSettingsStore((state) => state.speedUnit);

  return (
    <div className={styles.metrics} id={id}>
      <p className={styles.gear}>{carData[3]}</p>

      <div className={styles.speed}>
        <p className={styles.value}>{speedUnit === "metric" ? carData[2] : convertKmhToMph(carData[2])}</p>
        <p className={styles.unit}>{speedUnit === "metric" ? "km/h" : "mp/h"}</p>
      </div>

      <div className={styles.pedals}>
        <div className={styles.group}>
          <DriverPedals className="bg-red-500" value={carData[5]} maxValue={1} />
          <DriverPedals className="bg-emerald-500" value={carData[4]} maxValue={100} />
          <DriverPedals className="bg-blue-500" value={carData[0]} maxValue={15000} />
        </div>
      </div>
    </div>
  );
}
