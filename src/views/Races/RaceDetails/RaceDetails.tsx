import { addDays, differenceInHours, formatDistanceStrict, isBefore, isFuture, isSameDay, subHours } from "date-fns";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ListItem } from "../../../components/ListItem/ListItem";
import { useRaceDetails } from "../../../hooks/useRaceDetails/useRaceDetails";
import { EventSession } from "./EventSession/EventSession";
import styles from "./RaceDetails.module.scss";

interface RaceDetailsProps {
  id: string;
}

export const RaceDetails = ({ id }: RaceDetailsProps) => {
  const { racesDetailsState } = useRaceDetails(id);
  const firstListItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (racesDetailsState.state === "done") {
      firstListItemRef.current?.focus();
    }
  }, [racesDetailsState]);

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
      {racesDetailsState.data.map((raceDetails, i) => {
        const isDisabled = false;
        // const isDisabled = !raceDetails.isLive && isFuture(raceDetails.startDate);
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
              subtitle={formatDateRelative(raceDetails.startDate)}
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
  const now = subHours(new Date(), 2);
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
