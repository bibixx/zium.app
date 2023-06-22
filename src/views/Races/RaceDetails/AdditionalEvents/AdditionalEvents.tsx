import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { ListItem } from "../../../../components/ListItem/ListItem";
import { RaceDetailsData } from "../../../../hooks/useRaceDetails/useRacesDetails.types";
import { toTitleCase } from "../../../../utils/text";
import styles from "./AdditionalEvents.module.scss";

interface AdditionalEventsProps {
  additionalEvents: RaceDetailsData[];
  areAllEventsFinished: boolean;
}

export const AdditionalEvents = ({ additionalEvents, areAllEventsFinished }: AdditionalEventsProps) => {
  if (areAllEventsFinished && additionalEvents.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>More from Formula 1</div>
      {!areAllEventsFinished && (
        <div className={styles.zeroStateWrapper}>
          <InformationCircleIcon width={24} className={styles.zeroStateIcon} />
          <div className={styles.zeroStateContent}>
            <div className={styles.zeroStateHeader}>Check back soon for more shows</div>
            <div className={styles.zeroStateSubheader}>
              Pre & post shows for races and qualifications will appear here when they go live.
            </div>
          </div>
        </div>
      )}
      {additionalEvents.map((raceDetails) => {
        return (
          <ListItem
            key={raceDetails.id}
            caption={raceDetails.isLive ? <div className={styles.liveIndicator}>Live</div> : undefined}
            as={Link}
            to={`/race/${raceDetails.id}`}
          >
            {toTitleCase(raceDetails.title)}
          </ListItem>
        );
      })}
    </>
  );
};
