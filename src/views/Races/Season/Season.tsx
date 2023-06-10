import { useCallback, useState } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { EventCard } from "../../../components/EventCard/EventCard";
import { EventCardSkeleton } from "../../../components/EventCardSkeleton/EventCardSkeleton";
import { Sheet } from "../../../components/Sheet/Sheet";
import { TimedOutWrapper } from "../../../components/TimedOutWrapper/TimedOutWrapper";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useLaggedBehindData } from "../../../hooks/useLaggedBehindData/useLaggedBehindData";
import { RacesState } from "../../../hooks/useRacesList/useRacesList.types";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { formatDateRange } from "../../../utils/date";
import { toTitleCase } from "../../../utils/text";
import { RaceDetails } from "../RaceDetails/RaceDetails";
import styles from "./Season.module.scss";

interface SelectedRaceEvent {
  id: string;
  endDate: Date;
}

interface SeasonProps {
  season: RacesState;
}

export const Season = ({ season }: SeasonProps) => {
  const [selectedRaceEvent, setSelectedRaceEvent] = useState<SelectedRaceEvent | null>(null);

  const onSheetClose = useCallback(() => setSelectedRaceEvent(null), []);
  const scope = useHotkeysStack(selectedRaceEvent != null, false);
  useScopedHotkeys("esc", scope, onSheetClose);

  const heading = (
    <h2 className={styles.heading} id={`season-${season.seasonId}`} tabIndex={-1}>
      Season {season.seasonId}
    </h2>
  );

  if (season.state === "loading") {
    return (
      <>
        {heading}
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TimedOutWrapper timeout={100} key={i}>
              <EventCardSkeleton />
            </TimedOutWrapper>
          ))}
        </div>
      </>
    );
  }

  if (season.state === "error") {
    return (
      <>
        {heading}
        <div className={styles.errorWrapper}>
          <div className={styles.errorContent}>
            <ErrorMessage error={season.error} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {heading}
      <RaceDetailsSheet onClose={onSheetClose} selectedRaceEvent={selectedRaceEvent} />
      <div className={styles.grid}>
        {season.data.map(({ id, pictureUrl, countryName, startDate, endDate, roundNumber, description, countryId }) => {
          const onClick = () => {
            setSelectedRaceEvent({ id, endDate });
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
      </div>
    </>
  );
};

interface RaceDetailsSheetProps {
  selectedRaceEvent: SelectedRaceEvent | null;
  onClose: () => void;
}
const RaceDetailsSheet = ({ selectedRaceEvent, onClose }: RaceDetailsSheetProps) => {
  const isOpen = selectedRaceEvent != null;
  const { data: laggedSelectedRaceEvent, reset: resetLaggedState } = useLaggedBehindData(selectedRaceEvent, isOpen);

  return (
    <Sheet onClose={onClose} isOpen={selectedRaceEvent != null} onClosed={resetLaggedState}>
      {laggedSelectedRaceEvent && (
        <RaceDetails onClose={onClose} id={laggedSelectedRaceEvent.id} endDate={laggedSelectedRaceEvent.endDate} />
      )}
    </Sheet>
  );
};
