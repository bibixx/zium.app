import { isSameDay } from "date-fns";
import { useMemo, useState } from "react";
import { EventCard } from "../../../components/EventCard/EventCard";
import { Sheet } from "../../../components/Sheet/Sheet";
import { useRacesList } from "../../../hooks/useRacesList/useRacesList";
import { clone } from "../../../utils/clone";
import { RaceDetails } from "../RaceDetails/RaceDetails";

interface SeasonProps {
  seasonApiId: string;
}

export const Season = ({ seasonApiId }: SeasonProps) => {
  const { racesState } = useRacesList(seasonApiId);
  const [selectedRaceEvent, setSelectedRaceEvent] = useState<string | null>(null);

  const racesList = useMemo(() => {
    if (racesState.state !== "done") {
      return [];
    }

    const sortedRaces = clone(racesState.data).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    const latestFinishedRaceIndex = sortedRaces.findIndex((r) => r.startDate.getTime() <= Date.now());
    const latestFinishedRace = sortedRaces[latestFinishedRaceIndex];

    if (isSameDay(latestFinishedRace?.startDate, new Date())) {
      return racesState.data.slice(latestFinishedRaceIndex);
    }

    return racesState.data.slice(Math.max(0, latestFinishedRaceIndex - 1));
  }, [racesState]);

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
      {racesList.map(({ id, pictureUrl, countryName, startDate, endDate, roundNumber, description, countryId }) => {
        const onClick = () => {
          // if (startDate.getTime() > Date.now()) {
          //   return;
          // }

          setSelectedRaceEvent(id);
        };

        return (
          <EventCard
            key={id}
            pictureUrl={pictureUrl}
            countryName={countryName}
            displayDate={formatDateRange(startDate, endDate)}
            caption={`Round ${roundNumber}`}
            description={toTitleCase(description).replace(/Prix /, "Prix ")}
            countryId={countryId}
            onClick={onClick}
          />
        );
      })}
    </>
  );
};

const formatDateDayMonth = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
const formatDateRange = (startDate: Date, endDate: Date) =>
  `${formatDateDayMonth(startDate)}–${formatDateDayMonth(endDate)}`;

const firstUpper = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
const toTitleCase = (text: string) => text.split(" ").map(firstUpper).join(" ");
