import { isSameDay } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { EventCard } from "../../../components/EventCard/EventCard";
import { EventCardSkeleton } from "../../../components/EventCardSkeleton/EventCardSkeleton";
import { Sheet } from "../../../components/Sheet/Sheet";
import { TimedOutWrapper } from "../../../components/TimedOutWrapper/TimedOutWrapper";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useLaggedBehindData } from "../../../hooks/useLaggedBehindData/useLaggedBehindData";
import { useRacesList } from "../../../hooks/useRacesList/useRacesList";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { clone } from "../../../utils/clone";
import { formatDateRange } from "../../../utils/date";
import { toTitleCase } from "../../../utils/text";
import { RaceDetails } from "../RaceDetails/RaceDetails";
import styles from "./Season.module.scss";

interface SeasonProps {
  seasonApiId: string;
}

export const Season = ({ seasonApiId }: SeasonProps) => {
  const { racesState } = useRacesList(seasonApiId);
  const [selectedRaceEvent, setSelectedRaceEvent] = useState<string | null>(null);

  const onSheetClose = useCallback(() => setSelectedRaceEvent(null), []);
  const scope = useHotkeysStack(selectedRaceEvent != null, false);
  useScopedHotkeys("esc", scope, onSheetClose);

  const racesList = useMemo(() => {
    if (racesState.state !== "done") {
      return [];
    }

    const sortedRaces = clone(racesState.data).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    const latestFinishedRaceIndex = sortedRaces.findIndex((r) => r.endDate.getTime() <= Date.now());
    const latestFinishedRace = sortedRaces[latestFinishedRaceIndex];

    if (isSameDay(latestFinishedRace?.startDate, new Date())) {
      return sortedRaces.slice(latestFinishedRaceIndex);
    }

    return sortedRaces.slice(Math.max(0, latestFinishedRaceIndex - 1));
  }, [racesState]);

  if (racesState.state === "loading") {
    return (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <TimedOutWrapper timeout={100} key={i}>
            <EventCardSkeleton />
          </TimedOutWrapper>
        ))}
      </>
    );
  }

  if (racesState.state === "error") {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorContent}>
          <ErrorMessage error={racesState.error} />
        </div>
      </div>
    );
  }

  return (
    <>
      <RaceDetailsSheet onClose={onSheetClose} selectedRaceEvent={selectedRaceEvent} />
      {racesList.map(({ id, pictureUrl, countryName, startDate, endDate, roundNumber, description, countryId }) => {
        const onClick = () => {
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

interface RaceDetailsSheetProps {
  selectedRaceEvent: string | null;
  onClose: () => void;
}
const RaceDetailsSheet = ({ selectedRaceEvent, onClose }: RaceDetailsSheetProps) => {
  const isOpen = selectedRaceEvent != null;
  const { data: laggedSelectedRaceEvent, reset: resetLaggedState } = useLaggedBehindData(selectedRaceEvent, isOpen);

  return (
    <Sheet onClose={onClose} isOpen={selectedRaceEvent != null} onClosed={resetLaggedState}>
      {laggedSelectedRaceEvent && <RaceDetails id={laggedSelectedRaceEvent} />}
    </Sheet>
  );
};
