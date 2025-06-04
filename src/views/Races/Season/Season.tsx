import { useCallback, useState } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { EventCard } from "../../../components/EventCard/EventCard";
import { EventCardSkeleton } from "../../../components/EventCardSkeleton/EventCardSkeleton";
import { Sheet } from "../../../components/Sheet/Sheet";
import { TimedOutWrapper } from "../../../components/TimedOutWrapper/TimedOutWrapper";
import { useLaggedBehindData } from "../../../hooks/useLaggedBehindData/useLaggedBehindData";
import { RacesState } from "../../../hooks/useRacesList/useRacesList.types";
import { formatDateDayShortMonthRange } from "../../../utils/date";
import { formatRaceName } from "../../../utils/text";
import { RaceDetails } from "../RaceDetails/RaceDetails";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { stripNullables } from "../../../utils/mapAndStrip";
import styles from "./Season.module.scss";

interface SelectedRaceEvent {
  id: string;
  endDate: Date;
}

interface SeasonProps {
  season: RacesState;
  ziumOffsetsInfo: string[];
}

export const Season = ({ season, ziumOffsetsInfo }: SeasonProps) => {
  const [selectedRaceEvent, setSelectedRaceEvent] = useState<SelectedRaceEvent | null>(null);

  const onSheetClose = useCallback(() => setSelectedRaceEvent(null), []);
  useHotkeys(
    () => ({
      allowPropagation: false,
      enabled: selectedRaceEvent != null,
      hotkeys: [
        {
          keys: SHORTCUTS.CLOSE,
          action: onSheetClose,
        },
      ],
    }),
    [onSheetClose, selectedRaceEvent],
  );

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
      <RaceDetailsSheet
        onClose={onSheetClose}
        selectedRaceEvent={selectedRaceEvent}
        seasonId={season.seasonId}
        ziumOffsetsInfo={ziumOffsetsInfo}
      />
      <div className={styles.grid}>
        {season.data.map(
          ({
            id,
            pictureUrl,
            pictureLandscapeUrl,
            countryName,
            startDate,
            endDate,
            roundNumber,
            description,
            countryId,
            contentId,
            isSingleEvent,
          }) => {
            const onClick = () => {
              if (id != null) {
                setSelectedRaceEvent({ id, endDate });
              }
            };

            const props = isSingleEvent
              ? ({
                  as: "a",
                  href: `/race/${contentId}`,
                } as const)
              : {};

            return (
              <EventCard
                key={id ?? contentId}
                {...props}
                imgSrcList={stripNullables([pictureLandscapeUrl, pictureUrl])}
                countryName={countryName}
                displayDate={formatDateDayShortMonthRange(startDate, endDate)}
                caption={`Round ${roundNumber}`}
                description={formatRaceName(description, true)}
                countryId={countryId}
                onClick={onClick}
              />
            );
          },
        )}
      </div>
    </>
  );
};

interface RaceDetailsSheetProps {
  selectedRaceEvent: SelectedRaceEvent | null;
  onClose: () => void;
  seasonId: string;
  ziumOffsetsInfo: string[];
}
const RaceDetailsSheet = ({ selectedRaceEvent, onClose, seasonId, ziumOffsetsInfo }: RaceDetailsSheetProps) => {
  const isOpen = selectedRaceEvent != null;
  const { data: laggedSelectedRaceEvent, reset: resetLaggedState } = useLaggedBehindData(selectedRaceEvent, isOpen);

  return (
    <Sheet onClose={onClose} isOpen={selectedRaceEvent != null} onClosed={resetLaggedState}>
      {laggedSelectedRaceEvent && (
        <RaceDetails
          onClose={onClose}
          id={laggedSelectedRaceEvent.id}
          endDate={laggedSelectedRaceEvent.endDate}
          seasonId={seasonId}
          ziumOffsetsInfo={ziumOffsetsInfo}
        />
      )}
    </Sheet>
  );
};
