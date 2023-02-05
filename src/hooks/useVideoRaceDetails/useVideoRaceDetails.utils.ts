import {
  DriverStreamInfo,
  StreamDataDTO,
  StreamInfo,
} from "./useVideoRaceDetails.types";

const getStreamPrettyName = (name: string) => {
  switch (name) {
    case "F1 LIVE":
      return "F1 Live";
    case "TRACKER":
      return "Driver Tracker";
    case "DATA":
      return "Data Channel";
    case "INTERNATIONAL":
      return "International";
    case "PIT LANE":
      return "Pit Lane";
    default:
      return name;
  }
};

const getType = (stream: any): StreamInfo["type"] => {
  if (stream.identifier === "PRES") {
    return "main";
  }

  if (stream.identifier === "TRACKER") {
    return "driver-tracker";
  }

  if (stream.identifier === "DATA") {
    return "data-channel";
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
    const baseStreamInfo: StreamInfo = {
      type: getType(stream),
      channelId: stream.channelId,
      playbackUrl: stream.playbackUrl,
      title: getStreamPrettyName(stream.title),
      identifier: stream.identifier,
    };

    if (baseStreamInfo.type === "main") {
      defaultStream = baseStreamInfo;
      continue;
    }

    if (baseStreamInfo.type === "data-channel") {
      dataChannelStream = baseStreamInfo;
      continue;
    }

    if (baseStreamInfo.type === "driver-tracker") {
      driverTrackerStream = baseStreamInfo;
      continue;
    }

    if (stream.type === "obc") {
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

    otherStreams.push(baseStreamInfo);
  }

  return {
    defaultStream,
    driverStreams,
    otherStreams,
    driverTrackerStream,
    dataChannelStream,
  };
};
