import { StreamsStateData } from "../../hooks/useRaceDetails/useRaceDetails.types";
import { GridWindow } from "../../types/GridWindow";
import { assertNever } from "../../utils/assertNever";

export const combineWindowsWithStreams = (
  windows: GridWindow[],
  streams: StreamsStateData,
) => {
  return windows.map((w) => {
    if (w.type === "main") {
      return {
        ...w,
        url: streams.defaultStream?.playbackUrl!,
      };
    }

    if (w.type === "data-channel") {
      return {
        ...w,
        url: streams.dataChannelStream?.playbackUrl!,
      };
    }

    if (w.type === "driver-tracker") {
      return {
        ...w,
        url: streams.driverTrackerStream?.playbackUrl!,
      };
    }

    if (w.type === "driver") {
      const driverStream = streams.driverStreams.find((stream) => {
        return stream.title === w.streamIdentifier;
      });

      if (driverStream == null) {
        return w;
      }

      return {
        ...w,
        url: driverStream.playbackUrl,
        color: driverStream.hex,
        firstName: driverStream.driverFirstName,
        lastName: driverStream.driverLastName,
        team: driverStream.teamName,
      };
    }

    return assertNever(w);
  });
};

export const getAvailableDrivers = (streams: StreamsStateData) =>
  streams.driverStreams.map((driverStream) => ({
    color: driverStream.hex,
    firstName: driverStream.driverFirstName,
    lastName: driverStream.driverLastName,
    team: driverStream.teamName,
    id: driverStream.title,
  }));
