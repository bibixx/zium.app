import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { RaceInfo } from "../../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { Button } from "../../Button/Button";
import { CountryImage } from "../../CountryImage/CountryImage";
import styles from "./PlayerRaceInfo.module.scss";

interface PlayerRaceInfoProps {
  raceInfo: RaceInfo;
}

export const PlayerRaceInfo = ({ raceInfo }: PlayerRaceInfoProps) => {
  const { countryId, countryName, title, isRaceEvent } = raceInfo;

  return (
    <div className={styles.wrapper}>
      <Button variant="Tertiary" iconLeft={ArrowLeftIcon} as={Link} to="/" />
      <div className={styles.countryContent}>
        {countryId && <CountryImage countryId={countryId} width={40} height={40} />}
        {isRaceEvent ? (
          <div>
            <div className={styles.countryName}>{countryName}</div>
            <div className={styles.eventTitle}>{title}</div>
          </div>
        ) : (
          <div className={styles.nonRaceEventName}>{title}</div>
        )}
      </div>
    </div>
  );
};
