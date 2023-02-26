import { StreamsStateData } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow } from "../../types/GridWindow";
import { assertNever } from "../../utils/assertNever";

export const getWindowStreamMap = (windows: GridWindow[], streams: StreamsStateData) => {
  return Object.fromEntries(
    windows.map((w) => {
      if (w.type === "main") {
        return [w.id, streams.defaultStream?.playbackUrl ?? null];
      }

      if (w.type === "data-channel") {
        return [w.id, streams.dataChannelStream?.playbackUrl ?? null];
      }

      if (w.type === "driver-tracker") {
        return [w.id, streams.driverTrackerStream?.playbackUrl ?? null];
      }

      if (w.type === "driver") {
        const driverStream = streams.driverStreams.find((stream) => {
          return stream.title === w.driverId;
        });

        if (driverStream == null) {
          return [w.id, null];
        }

        return [w.id, driverStream.playbackUrl];
      }

      return assertNever(w);
    }),
  );
};

export interface DriverData {
  color: string;
  firstName: string;
  lastName: string;
  team: string;
  id: string;
  imageUrl: string;
}
export const getAvailableDrivers = (streams: StreamsStateData, season: number) =>
  streams.driverStreams.map((driverStream): DriverData => {
    const id = driverStream.title;
    return {
      color: driverStream.hex,
      firstName: driverStream.driverFirstName,
      lastName: driverStream.driverLastName,
      team: driverStream.teamName,
      id,
      imageUrl: `/images/avatars/${season}/${id}.png`,
    };
  });
