import {
  BaseStreamInfo,
  DriverStreamInfo,
  F1PlaybackOffsetsApiResponse,
  F1PlaybackOffsetsData,
  StreamDataDTO,
  StreamInfo,
  StreamInfoWithDriver,
} from "./useVideoRaceDetails.types";

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

const mapStreamIdentifierToType = (identifier: string): StreamInfoWithDriver["type"] => {
  if (identifier === "PRES") {
    return "main";
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

  return "other";
};

export const collectStreams = (streams: StreamDataDTO[]) => {
  let defaultStream: StreamInfo | null = null;
  let driverTrackerStream: StreamInfo | null = null;
  let dataChannelStream: StreamInfo | null = null;
  const driverStreams: DriverStreamInfo[] = [];
  const otherStreams: StreamInfo[] = [];

  for (const stream of streams) {
    const streamType = mapStreamIdentifierToType(stream.identifier);
    const baseStreamInfo: BaseStreamInfo = {
      channelId: stream.channelId,
      playbackUrl: stream.playbackUrl,
      title: getStreamPrettyName(stream.title),
      identifier: stream.identifier,
    };

    if (streamType === "main") {
      defaultStream = {
        type: streamType,
        ...baseStreamInfo,
      };
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
      const driverStreamInfo: DriverStreamInfo = {
        ...baseStreamInfo,
        type: "driver",
        racingNumber: stream.racingNumber,
        title: stream.title,
        reportingName: stream.reportingName,
        driverFirstName: stream.driverFirstName,
        driverLastName: stream.driverLastName,
        teamName: stream.teamName,
        constructorName: stream.constructorName,
        hex: stream.hex,
      };

      driverStreams.push(driverStreamInfo);
      continue;
    }

    otherStreams.push({
      type: "other",
      ...baseStreamInfo,
    });
  }

  return {
    defaultStream,
    driverStreams,
    otherStreams,
    driverTrackerStream,
    dataChannelStream,
  };
};

export const createF1OffsetsMap = (playbackOffsets: F1PlaybackOffsetsApiResponse[]): F1PlaybackOffsetsData => {
  const data: F1PlaybackOffsetsData = {};

  for (const offset of playbackOffsets) {
    const key = mapStreamIdentifierToType(offset.channelToAdjust);
    const value = offset.delaySeconds;
    const baseChannel = offset.channels.find((channel) => channel !== offset.channelToAdjust);

    if (baseChannel === undefined) {
      continue;
    }

    const baseChannelType = mapStreamIdentifierToType(baseChannel);
    const otherValues: Record<StreamInfoWithDriver["type"], number | undefined> = data[key] ?? {};
    otherValues[baseChannelType] = value;

    data[key] = otherValues;
  }

  return data;
};
