import { ArrowUturnLeftIcon, BellIcon, CheckIcon, SignalIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { differenceInMinutes, differenceInSeconds, sub } from "date-fns";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActiveAlarms } from "../../hooks/useActiveAlarms";
import { LiveEventState } from "../../hooks/useLiveEvent/useLiveEvent.types";
import { RaceData } from "../../hooks/useRacesList/useRacesList.types";
import { createAlarm, deleteAlarm } from "../../utils/extensionApi";
import { MDASH, NBSP, toTitleCase } from "../../utils/text";
import { Button } from "../Button/Button";
import { CountryImage } from "../CountryImage/CountryImage";
import { EventCardTag } from "../EventCardTag/EventCardTag";
import styles from "./LiveCard.module.scss";

interface LiveCardWithZeroStateProps {
  liveEventState: LiveEventState;
}
export const LiveCardWithZeroState = ({ liveEventState }: LiveCardWithZeroStateProps) => {
  const activeAlarms = useActiveAlarms();

  if (liveEventState.state === "loading") {
    return <div className={cn(styles.wrapperSkeleton, styles.marginWrapper)} />;
  }

  if (liveEventState.state !== "done" || liveEventState.data == null) {
    return null;
  }

  return (
    <div className={styles.marginWrapper}>
      <LiveCard raceDetails={liveEventState.data} activeAlarms={activeAlarms} />
    </div>
  );
};

interface LiveCardProps {
  raceDetails: RaceData;
  activeAlarms: string[];
}
const LiveCard = ({ raceDetails, activeAlarms }: LiveCardProps) => {
  const pictureUrl = `https://f1tv.formula1.com/image-resizer/image/${raceDetails.pictureUrl}?w=1800&h=1080&q=HI&o=L`;
  const countryName = raceDetails.countryName;
  const caption = `Round ${raceDetails.roundNumber}`;
  const description = toTitleCase(raceDetails.description).replace(" - ", `${NBSP}${MDASH}${NBSP}`);
  const countryId = raceDetails.countryId;
  const isReminderSet = activeAlarms.includes(String(raceDetails.contentId));

  const variant = useMemo(() => {
    if (raceDetails.isLive) {
      return "live";
    }

    return raceDetails.hasMedia ? "replay" : "upcoming";
  }, [raceDetails.hasMedia, raceDetails.isLive]);

  const canRemindFifteenMinutesBefore = differenceInMinutes(raceDetails.startDate, new Date()) >= 15;

  return (
    <Wrapper raceDetails={raceDetails} variant={variant}>
      <div className={styles.content}>
        <div>
          {variant === "live" && <EventCardTag variant="live">Live now</EventCardTag>}
          {variant === "upcoming" && (
            <EventCardTag variant="upcoming">
              <Timer startDate={raceDetails.startDate} />
            </EventCardTag>
          )}
          {variant === "replay" && <EventCardTag variant="upcoming">In case you missed it</EventCardTag>}
        </div>

        <div className={styles.bottomContent}>
          <div className={styles.raceDataWrapper}>
            <div className={styles.raceCountryWrapper}>
              <CountryImage countryId={countryId} width={40} height={40} />
              <div className={styles.raceCountryTextWrapper}>
                <div className={styles.raceCountry}>{countryName}</div>
                <div className={styles.raceRound}>{caption}</div>
              </div>
            </div>
            <div className={styles.raceTitle}>{description}</div>
          </div>
          {variant === "live" && (
            <Button variant="Primary" iconLeft={SignalIcon} as="div">
              Watch live now
            </Button>
          )}
          {variant === "upcoming" && (
            <Button
              variant="Secondary"
              iconLeft={isReminderSet ? CheckIcon : BellIcon}
              onClick={() => {
                if (isReminderSet) {
                  deleteAlarm(raceDetails.contentId);
                } else {
                  createAlarm({
                    id: raceDetails.contentId,
                    date: canRemindFifteenMinutesBefore
                      ? sub(raceDetails.startDate, { minutes: 15 }).getTime()
                      : raceDetails.startDate.getTime(),
                    eventName: description,
                    image: pictureUrl,
                  });
                }
              }}
            >
              {isReminderSet
                ? "Reminder set"
                : `Remind me ${canRemindFifteenMinutesBefore ? "15 minutes before" : "when the event starts"}`}
            </Button>
          )}
          {variant === "replay" && (
            <Button variant="Primary" iconLeft={ArrowUturnLeftIcon} as="div">
              Watch replay
            </Button>
          )}
        </div>
      </div>
      <div className={styles.contentBackground}></div>
      <div className={styles.shadow}></div>
      {raceDetails.isLive && <img className={styles.imageBlur} src={pictureUrl} alt="" />}
      <div className={styles.imageWrapper}>
        <img src={pictureUrl} className={cn(styles.image, { [styles.isLive]: raceDetails.isLive })} alt="" />
      </div>
    </Wrapper>
  );
};

interface WrapperProps {
  raceDetails: RaceData;
  variant: "live" | "upcoming" | "replay";
  children: ReactNode;
}
const Wrapper = ({ children, raceDetails, variant }: WrapperProps) => {
  const contentId = raceDetails.contentId;

  if (variant === "upcoming") {
    return <div className={styles.wrapper}>{children}</div>;
  }

  return (
    <Link className={styles.wrapper} to={`/race/${contentId}`}>
      {children}
    </Link>
  );
};

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
interface TimerProps {
  startDate: Date;
}
const Timer = ({ startDate }: TimerProps) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  const secondsDiff = Math.max(0, differenceInSeconds(startDate, now));
  const days = Math.floor(secondsDiff / DAY);
  const hours = Math.floor((secondsDiff - days * DAY) / HOUR);
  const minutes = Math.floor((secondsDiff - days * DAY - hours * HOUR) / MINUTE);
  const seconds = Math.floor(secondsDiff - days * DAY - hours * HOUR - minutes * MINUTE);

  const daysString = useMemo(() => {
    if (days === 0) {
      return "";
    }

    return days === 1 ? "1 day " : `${days} days `;
  }, [days]);
  const hoursString = String(hours).padStart(2, "0");
  const minutesString = String(minutes).padStart(2, "0");
  const secondsString = String(seconds).padStart(2, "0");

  return (
    <span>
      {daysString}
      {hoursString}:{minutesString}:{secondsString}
    </span>
  );
};
