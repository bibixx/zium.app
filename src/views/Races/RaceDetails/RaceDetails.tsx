import { Link } from "react-router-dom";
import { useRaceDetails } from "../../../hooks/useRaceDetails/useRaceDetails";

interface RaceDetailsProps {
  id: string;
  title: string;
}

export const RaceDetails = ({ title, id }: RaceDetailsProps) => {
  const { fetchRaceEvents, racesDetailsState } = useRaceDetails(id);

  const onToggle = () => {
    if (racesDetailsState.state !== "idle") {
      return;
    }

    fetchRaceEvents();
  };

  return (
    <details onToggle={onToggle}>
      <summary>{title}</summary>
      {racesDetailsState.state === "loading" && <div>Loading...</div>}
      {racesDetailsState.state === "error" && <div>Error: {racesDetailsState.error.toString()}</div>}
      {racesDetailsState.state === "done" &&
        (racesDetailsState.data.length ? (
          <ul>
            {racesDetailsState.data.map((raceDetails) => (
              <li key={raceDetails.id}>
                <Link to={`/race/${raceDetails.id}`}>{raceDetails.title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <strong>No races found</strong>
        ))}
    </details>
  );
};
