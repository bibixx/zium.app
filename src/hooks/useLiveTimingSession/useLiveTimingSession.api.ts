import { liveTimingIndexValidator } from "./useLiveTimingSession.validator";
import { LiveTimingIndex } from "./useLiveTimingSession.types";

const indexCache = new Map<number, LiveTimingIndex>();

export const fetchLiveTimingIndex = async (season: number, signal: AbortSignal): Promise<LiveTimingIndex> => {
  const cached = indexCache.get(season);
  if (cached) {
    return cached;
  }

  const response = await fetch(`https://livetiming.formula1.com/static/${season}/Index.json`, { signal });
  const data = await response.json();
  const parsed = liveTimingIndexValidator.parse(data);

  indexCache.set(season, parsed);
  return parsed;
};
