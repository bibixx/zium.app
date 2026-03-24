import { WorkerInMessage, WorkerOutMessage, TimingEntry } from "./useLiveTimingData.types";
import { parseJsonStreamLine } from "./useLiveTimingData.utils";
import { TimingTimeline } from "./useLiveTimingData.timeline";

const BASE_URL = "https://livetiming.formula1.com/static";

const STREAM_TOPICS = ["TimingData", "TimingAppData", "LapCount"] as const;
const ALL_STREAM_TOPICS = [...STREAM_TOPICS, "ExtrapolatedClock"] as const;

let timeline: TimingTimeline | null = null;

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function loadReplay(sessionPath: string) {
  post({ type: "loading" });

  try {
    // Fetch all keyframes and streams in parallel
    const [timingDataKf, driverListKf, timingAppDataKf, lapCountKf, ...streamTexts] = await Promise.all([
      // Keyframes (.json)
      fetchJson(`${BASE_URL}/${sessionPath}TimingData.json`).catch(() => ({})),
      fetchJson(`${BASE_URL}/${sessionPath}DriverList.json`).catch(() => ({})),
      fetchJson(`${BASE_URL}/${sessionPath}TimingAppData.json`).catch(() => ({})),
      fetchJson(`${BASE_URL}/${sessionPath}LapCount.json`).catch(() => ({})),
      // Streams (.jsonStream) — includes ExtrapolatedClock for time calibration
      ...ALL_STREAM_TOPICS.map((topic) => fetchText(`${BASE_URL}/${sessionPath}${topic}.jsonStream`).catch(() => "")),
    ]);

    // Parse all stream files into TimingEntry[]
    const entries: TimingEntry[] = [];

    ALL_STREAM_TOPICS.forEach((topic, i) => {
      const text = streamTexts[i];
      if (!text) return;

      const lines = text.split("\n").filter(Boolean);
      for (const line of lines) {
        const parsed = parseJsonStreamLine(line);
        if (parsed) {
          entries.push({
            elapsedMs: parsed.elapsedMs,
            topic,
            data: parsed.data,
          });
        }
      }
    });

    // Compute session start UTC from the first ExtrapolatedClock stream entry.
    // Each entry tells us: at elapsed time X, the wall clock was Y.
    // So sessionStartUTC = Y - X
    const firstClockEntry = entries.find((e) => e.topic === "ExtrapolatedClock");
    let sessionStartUTC = 0;
    if (firstClockEntry) {
      const clockData = firstClockEntry.data as Record<string, unknown>;
      const utcStr = clockData?.Utc as string | undefined;
      if (utcStr) {
        sessionStartUTC = new Date(utcStr).getTime() - firstClockEntry.elapsedMs;
      }
    }

    timeline = new TimingTimeline(entries, {
      timingData: timingDataKf as Record<string, unknown>,
      driverList: driverListKf as Record<string, unknown>,
      timingAppData: timingAppDataKf as Record<string, unknown>,
      lapCount: lapCountKf as Record<string, unknown>,
      sessionStartUTC,
    });

    post({ type: "ready", sessionStartUTC: timeline.startUTC });
  } catch (error) {
    post({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
}

function handleSeek(elapsedMs: number) {
  if (!timeline) {
    return;
  }

  const snapshot = timeline.getStateAt(elapsedMs);
  post({ type: "snapshot", data: snapshot });
}

self.addEventListener("message", (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case "load":
      if (msg.isLive) {
        // Live mode (SignalR) — to be implemented in a future step
        post({ type: "error", message: "Live timing mode is not yet implemented" });
      } else {
        loadReplay(msg.sessionPath);
      }
      break;

    case "seek":
      handleSeek(msg.elapsedMs);
      break;

    case "destroy":
      timeline = null;
      self.close();
      break;
  }
});
