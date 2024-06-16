import { CarDataEntryCar } from "../hooks/useTimingData/useTimingData.validator";

export enum CarDataValue {
  SPEED = 2,
  GEAR = 3,
}

export function getCarDataValue<T extends CarDataValue>(
  value: T,
  data: CarDataEntryCar,
): CarDataEntryCar["Channels"][T] {
  return data.Channels[value];
}

export function getLatestUtc<T extends { Utc: string }>(data: T[]): T {
  let latest = data[0];

  for (let i = 1; i < data.length; i++) {
    const dataUtc = new Date(data[i].Utc);
    const latestUtc = new Date(latest.Utc);

    if (dataUtc.getTime() > latestUtc.getTime()) {
      latest = data[i];
    }
  }

  return latest;
}
