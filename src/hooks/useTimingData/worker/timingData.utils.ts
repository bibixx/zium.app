import merge from "lodash.merge";
import { inflate } from "pako";
import { safeJSONParse } from "../../../utils/safeJSONParse";
import { TimingResponseValue, TimingResponse, TimingRoot } from "../useTimingData.validator";

export const decodeCompressedData = (data: unknown) => {
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

export const updateState = (state: TimingRoot | null, data: TimingResponseValue) => {
  return merge(state, data);
};

export function extractTime(data: TimingResponse) {
  if (data == null) {
    return null;
  }

  return data[0];
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
  let start = data[0][0];
  let end = data[0][0];

  for (const [d] of data) {
    start = Math.min(start, d);
    end = Math.max(end, d);
  }

  return {
    start,
    end,
  };
}
