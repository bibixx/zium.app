import merge from "lodash.merge";
import { inflate } from "pako";
import { safeJSONParse } from "../../../utils/safeJSONParse";
import {
  TimingRoot,
  TimingResponse,
  isMessageTimingResponse,
  isRecapTimingResponse,
  HeartbeatTimingRoot,
  parseTimingData,
} from "../useTimingData.validator";
import { EventEmitter } from "../../../utils/EventEmitter";

const decodeCompressedData = (data: unknown) => {
  if (typeof data !== "string") {
    return data;
  }

  return safeJSONParse(
    inflate(
      Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
      { to: "string", raw: true },
    ),
  );
};

export const updateState = (state: TimingRoot | null, data: TimingResponse) => {
  if (isMessageTimingResponse(data)) {
    const messages = Array.isArray(data.M) ? data.M : [data.M];

    for (const message of messages) {
      let [category, msg] = message.A;

      if (category == null || msg == null) {
        continue;
      }

      if (category.endsWith(".z")) {
        category = category.slice(0, -2);
        msg = decodeCompressedData(msg);
      }

      state = merge(state, { [category]: msg }) ?? state;
    }
  }

  if (isRecapTimingResponse(data)) {
    const R = {} as TimingRoot;
    for (const [key, value] of Object.entries(data.R)) {
      const k = key as keyof TimingRoot;

      if (!key.endsWith(".z")) {
        R[k] = value as any;
        continue;
      }

      const category = k.slice(0, -2) as keyof TimingRoot;
      R[category] = decodeCompressedData(value) as any;
    }

    state = merge(state, R) ?? state;
  }

  return state;
};

export function extractTime(data: TimingResponse) {
  if (isMessageTimingResponse(data) && data.M.length > 0) {
    return new Date(data.M[0].A[2]).getTime();
  } else if (isRecapTimingResponse(data)) {
    const result = HeartbeatTimingRoot.safeParse(data.R);

    if (!result.success) {
      return null;
    }

    return new Date(result.data.Heartbeat.Utc).getTime();
  } else {
    return null;
  }
}

export function binarySearch(data: TimingResponse[], searchedTime: number) {
  let left = 0;
  let right = data.length - 1;
  let result = right;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const time = extractTime(data[mid]);

    if (time !== null && time <= searchedTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

export function getDataRange(data: TimingResponse[]) {
  let start: number | null = null;
  for (let i = 0; i < data.length; i++) {
    const extractedTime = extractTime(data[i]);
    if (extractedTime != null) {
      start = extractedTime;
      break;
    }
  }

  if (start == null) {
    return null;
  }

  let end: number | null = null;
  for (let i = data.length - 1; i >= 0; i--) {
    const extractedTime = extractTime(data[i]);
    if (extractedTime != null) {
      end = extractedTime;
      break;
    }
  }

  if (end == null) {
    return null;
  }

  if (start > end) {
    [start, end] = [end, start];
  }

  return {
    start,
    end,
  };
}

export type DebugWSEmitterHandlers = { received: (line: unknown[]) => void; batch: (state: TimingRoot) => void };
export async function debugWS(emitter: EventEmitter<DebugWSEmitterHandlers>) {
  // eslint-disable-next-line import/no-unresolved
  const { default: data } = await import("../../../data/saudi.q.data.txt?raw");
  const lines = data.split("\n");

  const ls: unknown[] = [];
  for (const line of lines) {
    const parsedLine = safeJSONParse(line);
    const td = parseTimingData(parsedLine);

    if (parsedLine == null || !td.success) {
      continue;
    }

    ls.push(parsedLine);
  }

  emitter.emit("received", ls);
}
