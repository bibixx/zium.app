import { Link } from "react-router-dom";
import styles from "./RaceDetails.module.scss";
import { EventCard } from "../../../components/EventCard/EventCard";
import { useRaceDetails } from "../../../hooks/useRaceDetails/useRaceDetails";

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
        <EventCard
          key={raceDetails.id}
          as={Link}
          to={`/race/${raceDetails.id}`}
          pictureUrl={raceDetails.pictureUrl}
          countryName={raceDetails.title}
          displayDate={formatDate(raceDetails.startDate)}
        />
      ))}
    </div>
  );
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
