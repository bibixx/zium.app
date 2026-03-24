import { TimingDriver, TimingSnapshot, SectorTime } from "./useLiveTimingData.types";

/**
 * Deep merge two objects. Arrays are replaced, not merged.
 * This follows F1's incremental diff pattern where each update
 * is a sparse object that should be merged into accumulated state.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = (result as Record<string, unknown>)[key];

    if (sourceValue === null || sourceValue === undefined) {
      continue;
    }

    if (
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Parse a timestamp line from .jsonStream format
 * Format: "HH:MM:SS.mmm{json}" or "HH:MM:SS.mmmmmm{json}"
 */
export function parseJsonStreamLine(line: string): { elapsedMs: number; data: unknown } | null {
  // Find the first '{' to split timestamp from JSON
  const jsonStart = line.indexOf("{");
  if (jsonStart === -1) {
    return null;
  }

  const timestamp = line.substring(0, jsonStart);
  const jsonStr = line.substring(jsonStart);

  try {
    const data = JSON.parse(jsonStr);
    const elapsedMs = parseTimestamp(timestamp);
    return { elapsedMs, data };
  } catch {
    return null;
  }
}

/**
 * Parse "HH:MM:SS.mmm" timestamp to milliseconds
 */
function parseTimestamp(ts: string): number {
  const parts = ts.split(":");
  if (parts.length !== 3) {
    return 0;
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(".");
  const seconds = parseInt(secondsParts[0], 10);
  // Handle variable precision (3 or 6 decimal places)
  const fractionStr = (secondsParts[1] ?? "0").substring(0, 3);
  const ms = parseInt(fractionStr.padEnd(3, "0"), 10);

  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

/**
 * Extract a TimingSnapshot from accumulated raw state
 */
export function buildSnapshot(
  timingData: Record<string, unknown>,
  driverList: Record<string, unknown>,
  timingAppData: Record<string, unknown>,
  lapCount: Record<string, unknown>,
  sessionStartUTC: number,
): TimingSnapshot {
  const drivers: TimingDriver[] = [];
  const lines = (timingData as { Lines?: Record<string, Record<string, unknown>> })?.Lines ?? {};

  for (const [racingNumber, driverTiming] of Object.entries(lines)) {
    const driverInfo = (driverList as Record<string, Record<string, unknown>>)?.[racingNumber] ?? {};
    const appData = (timingAppData as { Lines?: Record<string, Record<string, unknown>> })?.Lines?.[racingNumber] ?? {};

    const position = Number(driverTiming?.Position ?? driverTiming?.Line ?? 0);
    const tla = String(driverInfo?.Tla ?? racingNumber);
    const teamColor = String(driverInfo?.TeamColour ?? "FFFFFF");

    const gapToLeader = String(
      (driverTiming?.GapToLeader as string) ?? (driverTiming as Record<string, unknown>)?.TimeDiffToFastest ?? "",
    );
    const intervalToPositionAhead = String(
      (driverTiming?.IntervalToPositionAhead as Record<string, unknown>)?.Value ??
        (driverTiming as Record<string, unknown>)?.TimeDiffToPositionAhead ??
        "",
    );

    const lastLapData = (driverTiming?.LastLapTime as Record<string, unknown>) ?? {};
    const lastLapTime = String(lastLapData?.Value ?? "");
    const lastLapTimePersonalBest = lastLapData?.PersonalFastest === true;
    const lastLapTimeOverallBest = lastLapData?.OverallFastest === true;

    // Tire info from TimingAppData
    const stints = (appData?.Stints as Record<string, Record<string, unknown>>) ?? {};
    const stintKeys = Object.keys(stints).sort((a, b) => Number(a) - Number(b));
    const latestStint = stintKeys.length > 0 ? stints[stintKeys[stintKeys.length - 1]] : null;
    const tire = String(latestStint?.Compound ?? "");

    const numberOfPitStops = Number(driverTiming?.NumberOfPitStops ?? 0);

    // Sectors
    const sectorsData = (driverTiming?.Sectors as Record<string, Record<string, unknown>>) ?? {};
    const sectors: SectorTime[] = Object.keys(sectorsData)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => {
        const sector = sectorsData[key];
        return {
          value: String(sector?.Value ?? ""),
          personalBest: sector?.PersonalFastest === true,
          overallBest: sector?.OverallFastest === true,
        };
      });

    if (position > 0) {
      drivers.push({
        racingNumber,
        position,
        tla,
        teamColor,
        gapToLeader,
        intervalToPositionAhead,
        lastLapTime,
        lastLapTimePersonalBest,
        lastLapTimeOverallBest,
        tire,
        numberOfPitStops,
        sectors,
      });
    }
  }

  drivers.sort((a, b) => a.position - b.position);

  const currentLap = Number((lapCount as Record<string, unknown>)?.CurrentLap ?? 0);
  const totalLaps = Number((lapCount as Record<string, unknown>)?.TotalLaps ?? 0);

  return {
    drivers,
    lapCount: currentLap > 0 ? { currentLap, totalLaps } : null,
    sessionStartUTC,
  };
}
