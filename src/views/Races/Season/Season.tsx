import { useState } from "react";
import { EventCard } from "../../../components/EventCard/EventCard";
import { Sheet } from "../../../components/Sheet/Sheet";
import { useRacesList } from "../../../hooks/useRacesList/useRacesList";
import { RaceDetails } from "../RaceDetails/RaceDetails";

interface SeasonProps {
  seasonApiId: string;
}

export const Season = ({ seasonApiId }: SeasonProps) => {
  const { racesState } = useRacesList(seasonApiId);
  const [selectedRaceEvent, setSelectedRaceEvent] = useState<string | null>(null);

  if (racesState.state === "loading") {
    return <div>Loading...</div>;
  }

  if (racesState.state === "error") {
    return <div>Error {racesState.error.toString()}</div>;
  }

  return (
    <>
      <Sheet onClose={() => setSelectedRaceEvent(null)} isOpen={selectedRaceEvent != null}>
        {selectedRaceEvent && <RaceDetails id={selectedRaceEvent} />}
      </Sheet>
      {racesState.data
        .filter(({ startDate }) => startDate.getTime() <= Date.now())
        .map(({ id, pictureUrl, countryName, startDate, endDate, roundNumber, description, countryId }) => (
          <EventCard
            key={id}
            pictureUrl={pictureUrl}
            countryName={countryName}
            displayDate={formatDateRange(startDate, endDate)}
            caption={`Round ${roundNumber}`}
            description={toTitleCase(description).replace(/Prix /, "Prix ")}
            countryId={countryId}
            onClick={() => setSelectedRaceEvent(id)}
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
