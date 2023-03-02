import { Link } from "react-router-dom";
import { EventCard } from "../../../components/EventCard/EventCard";
import { useRacesList } from "../../../hooks/useRacesList/useRacesList";

interface SeasonProps {
  seasonApiId: string;
  seasonId: string;
}

export const Season = ({ seasonApiId, seasonId }: SeasonProps) => {
  const { racesState } = useRacesList(seasonApiId);

  if (racesState.state === "loading") {
    return <div>Loading...</div>;
  }

  if (racesState.state === "error") {
    return <div>Error {racesState.error.toString()}</div>;
  }

  return (
    <>
      {racesState.data
        .filter(({ startDate }) => startDate.getTime() <= Date.now())
        .map(({ id, pictureUrl, countryName, startDate, endDate, roundNumber, description, countryId }) => (
          <EventCard
            as={Link}
            to={`/season/${seasonId}/${id}`}
            key={id}
            pictureUrl={pictureUrl}
            countryName={countryName}
            displayDate={formatDateRange(startDate, endDate)}
            caption={`Round ${roundNumber}`}
            description={toTitleCase(description).replace(/Prix /, "Prix ")}
            countryId={countryId}
          />
        ))}
    </>
  );
};

const formatDateDayMonth = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
const formatDateRange = (startDate: Date, endDate: Date) =>
  `${formatDateDayMonth(startDate)}–${formatDateDayMonth(endDate)}`;

const firstUpper = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
const toTitleCase = (text: string) => text.split(" ").map(firstUpper).join(" ");
