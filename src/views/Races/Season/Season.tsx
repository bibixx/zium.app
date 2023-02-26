import { useState } from "react";
import { useRacesList } from "../../../hooks/useRacesList/useRacesList";
import { RaceDetails } from "../RaceDetails/RaceDetails";

interface SeasonProps {
  seasonId: string;
  title: string;
  openByDefault?: boolean;
}

export const Season = ({ title, seasonId, openByDefault = false }: SeasonProps) => {
  const [isOpen, setIsOpen] = useState(openByDefault);
  const { racesState } = useRacesList(isOpen ? seasonId : null);

  const onToggle = () => {
    if (isOpen) {
      return;
    }

    setIsOpen(true);
  };

  return (
    <details onToggle={onToggle} open={isOpen}>
      <summary>
        <h2>{title}</h2>
      </summary>
      {racesState.state === "loading" && <div>Loading...</div>}
      {racesState.state === "error" && <div>Error {racesState.error.toString()}</div>}
      {racesState.state === "done" &&
        racesState.data.map(({ id, title }) => <RaceDetails key={id} id={id} title={title} />)}
    </details>
  );
};
