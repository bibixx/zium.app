import { Stint } from "../../types/state.type";
import styles from "./DriverTire.module.scss";

type Props = {
  stints: Stint[] | undefined;
  id?: string;
};

export default function DriverTire({ stints, id }: Props) {
  const stops = stints ? stints.length - 1 : 0;
  const currentStint = stints ? stints[stints.length - 1] : null;
  const unknownCompound = !["soft", "medium", "hard", "intermediate", "wet"].includes(
    currentStint?.compound?.toLowerCase() ?? "",
  );

  return (
    <div className={styles.tire} id={id}>
      {currentStint && !unknownCompound && currentStint.compound && (
        <img
          src={"/tires/" + currentStint.compound.toLowerCase() + ".svg"}
          width={32}
          height={32}
          alt={currentStint.compound}
          className={styles.image}
        />
      )}

      {currentStint && unknownCompound && (
        <div className={styles.image}>
          <img src={"/tires/unknown.svg"} width={32} height={32} alt={"unknown"} />
        </div>
      )}

      {!currentStint && <div className={`${styles.image} ${styles.loading}`} />}

      <div className={styles.info}>
        <p className={styles.laps}>
          L {currentStint?.totalLaps ?? 0}
          {currentStint?.new ? "" : "*"}
        </p>
        <p className={styles.stops}>PIT {stops}</p>
      </div>
    </div>
  );
}
