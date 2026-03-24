// Worker message protocol
export type WorkerInMessage =
  | { type: "load"; sessionPath: string; isLive: boolean; token?: string }
  | { type: "seek"; elapsedMs: number }
  | { type: "destroy" };

export type WorkerOutMessage =
  | { type: "loading" }
  | { type: "ready"; sessionStartUTC: number }
  | { type: "snapshot"; data: TimingSnapshot }
  | { type: "error"; message: string };

// Timing data structures
export interface TimingSnapshot {
  drivers: TimingDriver[];
  lapCount: LapCount | null;
  sessionStartUTC: number;
}

export interface TimingDriver {
  racingNumber: string;
  position: number;
  tla: string;
  teamColor: string;
  gapToLeader: string;
  intervalToPositionAhead: string;
  lastLapTime: string;
  lastLapTimePersonalBest: boolean;
  lastLapTimeOverallBest: boolean;
  tire: string;
  numberOfPitStops: number;
  sectors: SectorTime[];
}

export interface SectorTime {
  value: string;
  personalBest: boolean;
  overallBest: boolean;
}

export interface LapCount {
  currentLap: number;
  totalLaps: number;
}

// Raw F1 timing data types (from jsonStream)
export interface TimingEntry {
  elapsedMs: number;
  topic: string;
  data: unknown;
}
