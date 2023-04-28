import { SignalIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { LiveRaceData } from "../../hooks/useLiveEvent/useLiveEvent.types";
import { toTitleCase } from "../../utils/text";
import { Button } from "../Button/Button";
import { CountryImage } from "../CountryImage/CountryImage";
import { EventCardTag } from "../EventCardTag/EventCardTag";
import styles from "./LiveCard.module.scss";

interface LiveCardProps {
  raceDetails: LiveRaceData;
}
export const LiveCard = ({ raceDetails }: LiveCardProps) => {
  const pictureUrl = `https://f1tv.formula1.com/image-resizer/image/${raceDetails.pictureUrl}?w=1500&h=900&q=HI&o=L`;
  const countryName = raceDetails.countryName;
  const caption = `Round ${raceDetails.roundNumber}`;
  const description = toTitleCase(raceDetails.description).replace(" - ", "\xa0-\xa0");
  const countryId = raceDetails.countryId;
  const contentId = raceDetails.contentId;

  return (
    <Link className={styles.wrapper} to={`/race/${contentId}`}>
      <div className={styles.content}>
        <div>
          <EventCardTag variant="live">Live now</EventCardTag>
        </div>

        <div className={styles.bottomContent}>
          <div className={styles.raceDataWrapper}>
            <div className={styles.raceCountryWrapper}>
              <CountryImage countryId={countryId} width={40} height={40} />
              <div className={styles.raceCountryTextWrapper}>
                <div className={styles.raceCountry}>{countryName}</div>
                <div className={styles.raceRound}>{caption}</div>
              </div>
            </div>
            <div className={styles.raceTitle}>{description}</div>
          </div>
          <Button variant="Primary" iconLeft={SignalIcon} as="div">
            Watch live now
          </Button>
        </div>
      </div>
      <div className={styles.contentBackground}></div>
      <div className={styles.shadow}></div>
      <img className={styles.imageBlur} src={pictureUrl} alt="" />
      <img className={styles.image} src={pictureUrl} alt="" />
    </Link>
  );
};
