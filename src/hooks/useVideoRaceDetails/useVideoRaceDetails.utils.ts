import { assertNever } from "../../utils/assertNever";
import {
  BaseStreamInfo,
  // DriverStreamDataDTO,
  DriverStreamInfo,
  F1PlaybackOffsetsApiResponse,
  F1PlaybackOffsetsData,
  DataStreamInfo,
  MainStreamInfo,
  StreamInfoWithDriver,
} from "./useVideoRaceDetails.types";
import { DriverStreamData, StreamData } from "./useVideoRaceDetails.validator";

const getStreamPrettyName = (name: string) => {
  switch (name) {
    case "F1 LIVE":
      return "F1 Live";
    case "TRACKER":
      return "Tracker";
    case "DATA":
      return "Data";
    case "INTERNATIONAL":
      return "International";
    case "PIT LANE":
      return "Pit Lane";
    default:
      return name;
  }
};

const mapStreamIdentifierToType = (identifier: string): StreamInfoWithDriver["type"] | null => {
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

export const collectStreams = (streams: StreamData[] | undefined, raceId: string) => {
  const defaultStreams: MainStreamInfo[] = [];
  let driverTrackerStream: DataStreamInfo | null = null;
  let dataChannelStream: DataStreamInfo | null = null;
  const driverStreams: DriverStreamInfo[] = [];

  if (streams == null) {
    const defaultStream: MainStreamInfo = {
      type: "f1live",
      channelId: 0,
      playbackUrl: `CONTENT/PLAY?contentId=${raceId}`,
      title: getStreamPrettyName("F1 LIVE"),
      identifier: "main",
    };

    return {
      defaultStreams: [defaultStream],
      driverStreams,
      driverTrackerStream,
      dataChannelStream,
    };
  }

  for (const stream of streams) {
    const streamType = mapStreamIdentifierToType(stream.identifier);
    const baseStreamInfo: BaseStreamInfo = {
      channelId: stream.channelId,
      playbackUrl: stream.playbackUrl,
      title: getStreamPrettyName(stream.title),
      identifier: stream.identifier,
    };

    if (streamType === null) {
      continue;
    }

    if (streamType === "f1live") {
      defaultStreams.push({
        type: streamType,
        ...baseStreamInfo,
      });
      continue;
    }

    if (streamType === "international") {
      defaultStreams.push({
        type: streamType,
        ...baseStreamInfo,
      });
      continue;
    }

    if (streamType === "data-channel") {
      dataChannelStream = {
        type: streamType,
        ...baseStreamInfo,
      };
      continue;
    }

    if (streamType === "driver-tracker") {
      driverTrackerStream = {
        type: streamType,
        ...baseStreamInfo,
      };
      continue;
    }

    if (streamType === "driver") {
      const driverStream = stream as DriverStreamData;

      const driverStreamInfo: DriverStreamInfo = {
        ...baseStreamInfo,
        type: "driver",
        racingNumber: driverStream.racingNumber,
        title: driverStream.title,
        reportingName: driverStream.reportingName,
        driverFirstName: driverStream.driverFirstName,
        driverLastName: driverStream.driverLastName,
        teamName: driverStream.teamName,
        constructorName: driverStream.constructorName,
        hex: driverStream.hex,
      };

      driverStreams.push(driverStreamInfo);
      continue;
    }

    assertNever(streamType);
  }

  return {
    defaultStreams,
    driverStreams,
    driverTrackerStream,
    dataChannelStream,
  };
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
