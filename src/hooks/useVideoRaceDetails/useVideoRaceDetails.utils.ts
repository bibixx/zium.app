import { F1PlaybackOffsetsApiResponse, F1PlaybackOffsetsData, StreamInfoWithDriver } from "./useVideoRaceDetails.types";

export const mapStreamIdentifierToType = (identifier: string): StreamInfoWithDriver["type"] | null => {
  if (identifier === "PRES") {
    return "f1live";
  }

  if (identifier === "WIF") {
    return "international";
  }

  if (identifier === "TRACKER") {
    return "driver-tracker";
  }

  if (identifier === "DATA") {
    return "data-channel";
  }

  if (identifier === "OBC") {
    return "driver";
  }

  return null;
};

export const createF1OffsetsMap = (
  playbackOffsets: F1PlaybackOffsetsApiResponse[] | undefined,
): F1PlaybackOffsetsData => {
  const data: F1PlaybackOffsetsData = {};

  if (playbackOffsets == null) {
    return data;
  }

  for (const offset of playbackOffsets) {
    const key = mapStreamIdentifierToType(offset.channelToAdjust);

    if (key === null) {
      continue;
    }

    const value = offset.delaySeconds;
    const baseChannel = offset.channels.find((channel) => channel !== offset.channelToAdjust);

    if (baseChannel === undefined) {
      continue;
    }

    const baseChannelType = mapStreamIdentifierToType(baseChannel);

    if (baseChannelType === null) {
      continue;
    }

    const otherValues: Record<StreamInfoWithDriver["type"], number | undefined> = data[key] ?? {};
    otherValues[baseChannelType] = value;

    data[key] = otherValues;
  }

  return data;
};
