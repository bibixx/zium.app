import cn from "classnames";
import { useSettingsStore } from "../../../../hooks/liveTiming/useStores/useSettingsStore";
import { TimingDataDriver, TimingStatsDriver } from "../../types/state.type";
import styles from "./DriverMiniSectors.module.scss";

type Props = {
  sectors: TimingDataDriver["sectors"];
  bestSectors: TimingStatsDriver["bestSectors"] | undefined;
  tla: string;
  id?: string;
};

type MiniSectorProps = {
  wide: boolean;
  status: number;
};

const MiniSector = ({ wide, status }: MiniSectorProps) => {
  const textStatus = getMiniSectorStatus(status);
  const miniSectorClasses = cn([
    styles.miniSector,
    wide && styles.wide,
    textStatus === "slower" && styles.slower,
    textStatus === "personal" && styles.personal,
    textStatus === "overall" && styles.overall,
    textStatus === "pit" && styles.pit,
  ]);

  return <div className={miniSectorClasses} />;
};

export default function DriverMiniSectors({ sectors = [], bestSectors, tla, id }: Props) {
  const showMiniSectors = useSettingsStore((state) => state.showMiniSectors);
  const showBestSectors = useSettingsStore((state) => state.showBestSectors);

  const getTimeClasses = (isOverallFastest: boolean, isPersonalFastest: boolean, value: string | undefined) => {
    if (!value) return styles.empty;
    if (isOverallFastest) return styles.fastest;
    if (isPersonalFastest) return styles.personal;
    return "";
  };

  return (
    <div className={styles.sectors} id={id}>
      {sectors.map((sector, i) => (
        <div key={`sector.${tla}.${i}`} data-sector className={styles.sector} style={{ flex: sector.segments.length }}>
          <div className={styles.miniSectors} data-mini-sectors>
            {sector.segments.map((segment, j) => (
              <MiniSector
                wide={showBestSectors && showMiniSectors}
                status={segment.status}
                key={`sector.mini.${tla}.${j}`}
              />
            ))}
          </div>

          <div className={styles.sectorWithMini} data-sectors-data>
            <p
              className={[styles.time, getTimeClasses(sector.overallFastest, sector.personalFastest, sector.value)]
                .filter(Boolean)
                .join(" ")}
            >
              {sector.value ? sector.value : sector.previousValue ? sector.previousValue : "-- ---"}
            </p>

            {showBestSectors && (
              <p className={styles.best}>{bestSectors && bestSectors[i].value ? bestSectors[i].value : "-- ---"}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

type MiniSectorStatus = "slower" | "personal" | "overall" | "pit" | "last";
const getMiniSectorStatus = (status: number): MiniSectorStatus => {
  if (status === 2048 || status === 2052) return "slower";
  if (status === 2049) return "personal";
  if (status === 2051) return "overall";
  if (status === 2064) return "pit";
  return "last";
};
