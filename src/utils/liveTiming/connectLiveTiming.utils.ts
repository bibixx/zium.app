/* eslint-disable @typescript-eslint/no-explicit-any */

import { inflateRaw } from "pako";
import moment from "moment";

const isObject = (obj: unknown): boolean => {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
};

export const merge = (base: any, update: any): any => {
  if (isObject(base) && isObject(update)) {
    const result = { ...base };

    for (const [key, value] of Object.entries(update)) {
      result[key] = merge(base[key] ?? null, value);
    }

    return result;
  }

  if (Array.isArray(base) && Array.isArray(update)) {
    return base.concat(update);
  }

  if (Array.isArray(base) && isObject(update)) {
    const result = [...base];

    for (const [key, value] of Object.entries(update)) {
      const index = parseInt(key);
      result.splice(index, 1, merge(result[index], value));
    }

    return [...result];
  }

  return update;
};

export const inflate = <T>(data: string): T => {
  const binaryString = atob(data);

  const len = binaryString.length;

  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const inflatedData = inflateRaw(bytes, { to: "string" });

  return JSON.parse(inflatedData);
};

export const utcToLocalMs = (utcDateString: string): number => {
  return moment.utc(utcDateString).local().valueOf();
};
