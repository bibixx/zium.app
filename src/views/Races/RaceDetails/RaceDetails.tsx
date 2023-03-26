import { addDays, formatDistanceStrict, isBefore, isSameDay } from "date-fns";
import { Link } from "react-router-dom";
import { ListItem } from "../../../components/ListItem/ListItem";
import { useRaceDetails } from "../../../hooks/useRaceDetails/useRaceDetails";
import { EventSession } from "./EventSession/EventSession";
import styles from "./RaceDetails.module.scss";

interface RaceDetailsProps {
  id: string;
}

export const RaceDetails = ({ id }: RaceDetailsProps) => {
  const { racesDetailsState } = useRaceDetails(id);

  if (racesDetailsState.state === "loading") {
    return <div>Loading...</div>;
  }
  if (racesDetailsState.state === "error") {
    return <div>Error: {racesDetailsState.error.toString()}</div>;
  }

  if (racesDetailsState.data.length === 0) {
    <strong>No races found</strong>;
  }

  return (
    <div className={styles.grid}>
      {racesDetailsState.data.map((raceDetails) => (
        <ListItem className={styles.raceDetailsListItem} key={raceDetails.id} as={Link} to={`/race/${raceDetails.id}`}>
          <EventSession
            title={raceDetails.title}
            subtitle={formatDateRelative(raceDetails.startDate)}
            rightIconWrapperClassName={styles.raceDetailsListItemRightIconWrapper}
            isLive={raceDetails.isLive}
          />
        </ListItem>
      ))}
    </div>
  );
};

const formatDateRelative = (date: Date) => {
  const today = new Date();
  if (isBefore(date, today)) {
    return formatDate(date);
  }

  const tomorrow = addDays(today, 1);
  if (isSameDay(date, tomorrow)) {
    return "Starts tomorrow";
  }

  return "Starts in " + formatDistanceStrict(today, date, { addSuffix: false, roundingMethod: "ceil" });
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
