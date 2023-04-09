import { RaceInfo } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { CountryImage } from "../../CountryImage/CountryImage";
import styles from "./PlayerRaceInfo.module.scss";

interface PlayerRaceInfoProps {
  raceInfo: RaceInfo;
}

export const PlayerRaceInfo = ({ raceInfo }: PlayerRaceInfoProps) => {
  const { countryId, countryName, title } = raceInfo;
  return (
    <div className={styles.wrapper}>
      {countryId && <CountryImage countryId={countryId} width={40} height={40} />}
      <div>
        <div className={styles.countryName}>{countryName}</div>
        <div className={styles.eventTitle}>{title}</div>
      </div>
    </div>
  );
};
