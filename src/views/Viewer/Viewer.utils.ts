import { DriverStreamInfo, StreamsStateData } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { GridWindow } from "../../types/GridWindow";
import { assertNever } from "../../utils/assertNever";

export const getWindowStreamMap = (windows: GridWindow[], streams: StreamsStateData) => {
  return Object.fromEntries(
    windows.map((w) => {
      if (w.type === "main") {
        const stream = streams.defaultStreams.find((stream) => stream.type === w.streamId);
        return [w.streamId, stream?.playbackUrl ?? null];
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
  imageUrls: string[];
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
      imageUrls: [
        `/images/avatars/${season}/${id}.png`,
        getDriverUrl(driverStream, false),
        `/images/avatars/default.png`,
      ],
    };
  });

const getDriverUrl = (driverStream: DriverStreamInfo, useFallback: boolean) => {
  const driverIdFirstNamePart = driverStream.driverFirstName.replace(" ", "").slice(0, 3).toUpperCase();
  const driverIdLastNamePart = driverStream.driverLastName.replace(" ", "").slice(0, 3).toUpperCase();
  const driverIdNumberPart = "01";
  const driverId = [driverIdFirstNamePart, driverIdLastNamePart, driverIdNumberPart].join("");

  const parts = [
    "https://media.formula1.com",
    useFallback ? "d_driver_fallback_image.png" : "d_driver_image.png",
    "content/dam/fom-website/drivers",
    driverId[0],
    `${driverId}_${driverStream.driverFirstName}_${driverStream.driverLastName}`,
    `${driverId.toLowerCase()}.png.transform`,
    "2col/image.png",
  ];

  return parts.join("/");
};
