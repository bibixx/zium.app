import moment from "moment";
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

export function SessionInfo() {
  const clock = useDataStore((state) => state?.extrapolatedClock);
  const session = useDataStore((state) => state.sessionInfo);
  const timingData = useDataStore((state) => state.timingData);

  const delay = useSettingsStore((state) => state.delay);

  const timeRemaining =
    !!clock && !!clock.remaining
      ? clock.extrapolating
        ? utc(
            duration(clock.remaining)
              .subtract(utc().diff(utc(clock.utc)))
              .asMilliseconds() + (delay ? delay * 1000 : 0),
          ).format("HH:mm:ss")
        : clock.remaining
      : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {session ? (
          <h1 className={styles.title}>
            {session.meeting.name}: {session.name ?? "Unknown"}
            {timingData?.sessionPart ? ` ${sessionPartPrefix(session.name)}${timingData.sessionPart}` : ""}
          </h1>
        ) : (
          <div className={styles.skeleton} />
        )}

        {timeRemaining !== undefined ? (
          <p className={styles.time}>{timeRemaining}</p>
        ) : (
          <div className={styles.timeSkeleton} />
        )}
      </div>
    </div>
  );
}
