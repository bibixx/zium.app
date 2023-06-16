import { addDays, differenceInHours, formatDistanceStrict, isAfter, isBefore, isSameDay } from "date-fns";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button/Button";
import { DialogContentInformation } from "../../../components/Dialog/DialogContent/DialogContent";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { ListItem } from "../../../components/ListItem/ListItem";
import { useRaceDetails } from "../../../hooks/useRaceDetails/useRaceDetails";
import { EventSession } from "./EventSession/EventSession";
import styles from "./RaceDetails.module.scss";

interface RaceDetailsProps {
  id: string;
  endDate: Date;
  onClose: () => void;
}

export const RaceDetails = ({ id, endDate, onClose }: RaceDetailsProps) => {
  const { racesDetailsState } = useRaceDetails(id);
  const firstListItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (racesDetailsState.state === "done") {
      firstListItemRef.current?.focus();
    }
  }, [racesDetailsState]);

  if (racesDetailsState.state === "loading") {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ListItem as="div" disabled key={i}>
            <EventSession title="" subtitle="" isLoading />
          </ListItem>
        ))}
      </div>
    );
  }

  if (racesDetailsState.state === "error") {
    return (
      <div className={styles.errorWrapper}>
        <ErrorMessage error={racesDetailsState.error} />
      </div>
    );
  }

  if (racesDetailsState.data.length === 0) {
    const isUpcomingEvent = isAfter(endDate, new Date());

    if (!isUpcomingEvent) {
      return (
        <div className={styles.errorWrapper}>
          <DialogContentInformation
            title="Grand Prix cancelled"
            subtitle="The F1 officials have waved the yellow flag and this Grand Prix is no more. Buckle up for the next race, it's going to be a thrilling ride!"
          />
          <div className={styles.zeroStateButtonWrapper}>
            <Button fluid variant="Secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.errorWrapper}>
          <DialogContentInformation
            title="No schedule yet"
            subtitle="It seems the schedule for this Grand Prix is still in the pit lane. Once the F1 officials wave the green flag, we'll have it right here for you."
          />
          <div className={styles.zeroStateButtonWrapper}>
            <Button fluid variant="Secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.grid}>
      {racesDetailsState.data.map((raceDetails, i) => {
        const isDisabled = !raceDetails.isLive && !raceDetails.hasMedia;
        const props = isDisabled ? ({ as: "div" } as const) : ({ as: Link, to: `/race/${raceDetails.id}` } as const);

        return (
          <ListItem<"div" | typeof Link>
            className={styles.raceDetailsListItem}
            disabled={isDisabled}
            key={raceDetails.id}
            ref={i === 0 ? firstListItemRef : undefined}
            {...props}
          >
            <EventSession
              title={raceDetails.title}
              subtitle={raceDetails.startDate !== null ? formatDateRelative(raceDetails.startDate) : null}
              rightIconWrapperClassName={styles.raceDetailsListItemRightIconWrapper}
              isLive={raceDetails.isLive}
              disabled={isDisabled}
            />
          </ListItem>
        );
      })}
    </div>
  );
};

const formatDateRelative = (date: Date) => {
  const now = new Date();
  if (isBefore(date, now)) {
    return formatDate(date);
  }

  const hoursDiff = differenceInHours(date, now, { roundingMethod: "ceil" });

  const tomorrow = addDays(now, 1);
  if (isSameDay(date, tomorrow) && hoursDiff > 12) {
    return "Starts tomorrow";
  }

  return "Starts in " + formatDistanceStrict(now, date, { addSuffix: false, roundingMethod: "ceil" });
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
