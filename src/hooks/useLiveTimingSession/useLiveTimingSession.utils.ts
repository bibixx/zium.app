import { EventGenre } from "../../constants/races";
import { LiveTimingIndex, LiveTimingSessionMatch } from "./useLiveTimingSession.types";

const GENRE_TO_TYPE: Partial<Record<EventGenre, string>> = {
  race: "Race",
  qualifying: "Qualifying",
  practice: "Practice",
  "sprint qualifying": "Sprint Qualifying",
  "sprint race": "Sprint",
  sprint: "Sprint",
};

export const matchLiveTimingSession = (
  index: LiveTimingIndex,
  startDate: Date,
  genre: EventGenre,
): LiveTimingSessionMatch | null => {
  const targetType = GENRE_TO_TYPE[genre];
  if (!targetType) {
    return null;
  }

  // Extract just the date part (YYYY-MM-DD) from the F1TV start date for comparison.
  // Index.json dates lack timezone info (they're in local circuit time), so comparing
  // exact timestamps is unreliable across timezones. Matching by date + session type
  // is sufficient since there's only one session of each type per meeting per day.
  const targetDate = startDate.toISOString().slice(0, 10);

  for (const meeting of index.Meetings) {
    const matchingSessions = meeting.Sessions.filter((s) => s.Type === targetType);
    if (matchingSessions.length > 0) {
      for (const session of matchingSessions) {
        const sessionDate = session.StartDate.slice(0, 10);

        if (sessionDate === targetDate) {
          return {
            path: session.Path,
            sessionKey: session.Key,
          };
        }
      }
    }
  }

  return null;
};
