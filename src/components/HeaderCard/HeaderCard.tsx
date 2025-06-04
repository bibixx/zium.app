import { ArrowUturnLeftIcon, BellIcon, CheckIcon, SignalIcon } from "@heroicons/react/20/solid";
import cn from "classnames";
import { differenceInMinutes, differenceInSeconds, sub } from "date-fns";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImage } from "react-image";
import { isRaceGenre } from "../../constants/races";
import { useActiveAlarms } from "../../hooks/useActiveAlarms";
import { RaceData } from "../../hooks/useRacesList/useRacesList.types";
import { createAlarm, deleteAlarm } from "../../utils/extensionApi";
import { fixEmDashes, formatRaceName, toTitleCase } from "../../utils/text";
import { Button } from "../Button/Button";
import { CountryImage } from "../CountryImage/CountryImage";
import { EventCardTag } from "../EventCardTag/EventCardTag";
import { HeaderCardDataState } from "../../hooks/useHeaderCardData/useHeaderCardData.types";
import { useFormulaImages } from "../../hooks/useFormulaImage/useFormulaImage";
import { stripNullables } from "../../utils/mapAndStrip";
import { useImageLoadState } from "../../hooks/useImageLoadedState/useImageLoadedState";
import styles from "./HeaderCard.module.scss";

interface HeaderCardWithZeroStateProps {
  eventState: HeaderCardDataState;
}
export const HeaderCardWithZeroState = ({ eventState: liveEventState }: HeaderCardWithZeroStateProps) => {
  const activeAlarms = useActiveAlarms();

  if (liveEventState.state === "loading") {
    return <div className={cn(styles.wrapperSkeleton, styles.marginWrapper)} />;
  }

  if (liveEventState.state !== "done" || liveEventState.data == null) {
    return null;
  }

  return (
    <div className={styles.marginWrapper}>
      <HeaderCard raceDetails={liveEventState.data} activeAlarms={activeAlarms} />
    </div>
  );
};

interface HeaderCardProps {
  raceDetails: RaceData;
  activeAlarms: string[];
}
const HeaderCard = ({ raceDetails, activeAlarms }: HeaderCardProps) => {
  const imgSrcList = stripNullables([raceDetails.pictureLandscapeUrl, raceDetails.pictureUrl]);
  const fullImgSrcList = useFormulaImages(imgSrcList, 400, 195);
  const { src } = useImage({
    srcList: fullImgSrcList,
    useSuspense: false,
  });
  const { imgProps, loadingState } = useImageLoadState(src);

  const countryName = raceDetails.countryName;
  const caption = `Round ${raceDetails.roundNumber}`;
  const isRaceEvent = isRaceGenre(raceDetails.genre);
  const description = isRaceEvent
    ? formatRaceName(raceDetails.description, false)
    : fixEmDashes(toTitleCase(raceDetails.description));
  const countryId = raceDetails.countryId;
  const isReminderSet = activeAlarms.includes(String(raceDetails.contentId));
  const isLive = raceDetails.isLive;

  const variant = useMemo(() => {
    if (isLive) {
      return "live";
    }

    return raceDetails.hasMedia ? "replay" : "upcoming";
  }, [raceDetails.hasMedia, isLive]);

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
                    image: src || raceDetails.pictureUrl,
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
      {isLive && (
        <div className={styles.imageBlur}>
          <div className={styles.imageWrapper}>
            <div className={styles.shadow}></div>
            <div className={cn({ [styles.imageTrimAdjustment]: isRaceEvent })}>
              <img
                src={src}
                {...imgProps}
                className={cn(styles.image, styles.isLive, { [styles.isLoaded]: loadingState === "loaded" })}
                alt=""
              />
            </div>
          </div>
        </div>
      )}
      <div className={styles.imageWrapper}>
        <div className={styles.shadow}></div>
        <div className={cn({ [styles.imageTrimAdjustment]: isRaceEvent })}>
          <img
            src={src}
            {...imgProps}
            className={cn(styles.image, { [styles.isLive]: isLive, [styles.isLoaded]: loadingState === "loaded" })}
            alt=""
          />
        </div>
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
