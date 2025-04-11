import moment from "moment";
import { memo } from "react";
import cn from "classnames";
import { useDataStore } from "../../../hooks/liveTiming/useStores/useDataStore";
import { useSettingsStore } from "../../../hooks/liveTiming/useStores/useSettingsStore";
import styles from "./SessionInfo.module.scss";

const sessionPartPrefix = (name: string) => {
  switch (name) {
    case "Sprint Qualifying":
      return "SQ";
    case "Qualifying":
      return "Q";
    default:
      return "";
  }
};

const { utc, duration } = moment;

const calculateTimeRemaining = (
  clock: { remaining: string; extrapolating: boolean; utc: string } | null | undefined,
  delay: number | undefined,
): string | undefined => {
  if (clock == null || clock.remaining == null) {
    return undefined;
  }

  if (clock.extrapolating == null) {
    return clock.remaining;
  }

  const actualDelay = delay ?? 0;
  const baseTime = duration(clock.remaining)
    .subtract(utc().diff(utc(clock.utc)))
    .asMilliseconds();

  return utc(baseTime + actualDelay * 1000).format("HH:mm:ss");
};

export const SessionInfo = memo(() => {
  const clock = useDataStore((state) => state?.extrapolatedClock);
  const session = useDataStore((state) => state.sessionInfo);
  const timingData = useDataStore((state) => state.timingData);
  const lapCount = useDataStore((state) => state.lapCount);

  const delay = useSettingsStore((state) => state.delay);

  const timeRemaining = calculateTimeRemaining(clock, delay);

  return (
    <div className={styles.container}>
      {session ? (
        <div className={styles.title}>
          {session.meeting.name}: {session.name ?? "Unknown"}
          {timingData?.sessionPart ? ` ${sessionPartPrefix(session.name)}${timingData.sessionPart}` : ""}
        </div>
      ) : (
        <div className={styles.skeleton} />
      )}

      {lapCount != null ? (
        <div className={cn(styles.lapCount)}>
          {lapCount?.currentLap} / {lapCount?.totalLaps}
        </div>
      ) : timeRemaining !== undefined ? (
        <div className={styles.time}>{timeRemaining}</div>
      ) : (
        <div className={styles.timeSkeleton} />
      )}
    </div>
  );
});
