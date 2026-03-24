import { TimingEntry, TimingSnapshot } from "./useLiveTimingData.types";
import { buildSnapshot, deepMerge } from "./useLiveTimingData.utils";

const SNAPSHOT_INTERVAL_MS = 30_000; // Pre-compute snapshot every 30 seconds

interface PrecomputedSnapshot {
  elapsedMs: number;
  timingData: Record<string, unknown>;
  driverList: Record<string, unknown>;
  timingAppData: Record<string, unknown>;
  lapCount: Record<string, unknown>;
  nextEntryIndex: number;
}

export class TimingTimeline {
  private entries: TimingEntry[] = [];
  private snapshots: PrecomputedSnapshot[] = [];
  private sessionStartUTC = 0;

  constructor(
    entries: TimingEntry[],
    keyframes: {
      timingData: Record<string, unknown>;
      driverList: Record<string, unknown>;
      timingAppData: Record<string, unknown>;
      lapCount: Record<string, unknown>;
      sessionStartUTC: number;
    },
  ) {
    this.entries = entries.sort((a, b) => a.elapsedMs - b.elapsedMs);
    this.sessionStartUTC = keyframes.sessionStartUTC;

    this.precomputeSnapshots(keyframes);
  }

  get startUTC(): number {
    return this.sessionStartUTC;
  }

  private precomputeSnapshots(keyframes: {
    timingData: Record<string, unknown>;
    driverList: Record<string, unknown>;
    timingAppData: Record<string, unknown>;
    lapCount: Record<string, unknown>;
  }) {
    let timingData = { ...keyframes.timingData };
    let driverList = { ...keyframes.driverList };
    let timingAppData = { ...keyframes.timingAppData };
    let lapCount = { ...keyframes.lapCount };

    // Initial snapshot at time 0
    this.snapshots.push({
      elapsedMs: 0,
      timingData: structuredClone(timingData),
      driverList: structuredClone(driverList),
      timingAppData: structuredClone(timingAppData),
      lapCount: structuredClone(lapCount),
      nextEntryIndex: 0,
    });

    let nextSnapshotMs = SNAPSHOT_INTERVAL_MS;

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];

      // Apply this entry
      switch (entry.topic) {
        case "TimingData":
          timingData = deepMerge(timingData, entry.data as Record<string, unknown>);
          break;
        case "DriverList":
          driverList = deepMerge(driverList, entry.data as Record<string, unknown>);
          break;
        case "TimingAppData":
          timingAppData = deepMerge(timingAppData, entry.data as Record<string, unknown>);
          break;
        case "LapCount":
          lapCount = deepMerge(lapCount, entry.data as Record<string, unknown>);
          break;
      }

      // Save snapshot at intervals
      if (entry.elapsedMs >= nextSnapshotMs) {
        this.snapshots.push({
          elapsedMs: entry.elapsedMs,
          timingData: structuredClone(timingData),
          driverList: structuredClone(driverList),
          timingAppData: structuredClone(timingAppData),
          lapCount: structuredClone(lapCount),
          nextEntryIndex: i + 1,
        });
        nextSnapshotMs = entry.elapsedMs + SNAPSHOT_INTERVAL_MS;
      }
    }
  }

  getStateAt(elapsedMs: number): TimingSnapshot {
    // Binary search for nearest snapshot <= elapsedMs
    let lo = 0;
    let hi = this.snapshots.length - 1;

    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (this.snapshots[mid].elapsedMs <= elapsedMs) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }

    const snapshot = this.snapshots[lo];
    let timingData = structuredClone(snapshot.timingData);
    let driverList = structuredClone(snapshot.driverList);
    let timingAppData = structuredClone(snapshot.timingAppData);
    let lapCount = structuredClone(snapshot.lapCount);

    // Apply remaining entries from snapshot to elapsedMs
    for (let i = snapshot.nextEntryIndex; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry.elapsedMs > elapsedMs) {
        break;
      }

      switch (entry.topic) {
        case "TimingData":
          timingData = deepMerge(timingData, entry.data as Record<string, unknown>);
          break;
        case "DriverList":
          driverList = deepMerge(driverList, entry.data as Record<string, unknown>);
          break;
        case "TimingAppData":
          timingAppData = deepMerge(timingAppData, entry.data as Record<string, unknown>);
          break;
        case "LapCount":
          lapCount = deepMerge(lapCount, entry.data as Record<string, unknown>);
          break;
      }
    }

    return buildSnapshot(timingData, driverList, timingAppData, lapCount, this.sessionStartUTC);
  }
}
