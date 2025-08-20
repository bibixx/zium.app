import { assertNever } from "../../../utils/assertNever";
import { MainStreamInfo, DataStreamInfo, DriverStreamInfo, BaseStreamInfo } from "../useVideoRaceDetails.types";
import { mapStreamIdentifierToType } from "../useVideoRaceDetails.utils";
import { StreamData, DriverStreamData } from "../useVideoRaceDetails.validator";
import { getStreamPrettyName } from "./collectStreams.utils";

export const collectStreams = (streams: StreamData[] | undefined, raceId: string) => {
  const defaultStreams: MainStreamInfo[] = [];
  let driverTrackerStream: DataStreamInfo | null = null;
  let dataChannelStream: DataStreamInfo | null = null;
  const driverStreams: DriverStreamInfo[] = [];

  if (streams == null) {
    const defaultStream: MainStreamInfo = {
      type: "f1live",
      channelId: 0,
      playbackUrl: { url: `CONTENT/PLAY?contentId=${raceId}`, needsFetching: true },
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
      playbackUrl: { url: stream.playbackUrl, needsFetching: true },
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
