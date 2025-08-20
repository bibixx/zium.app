import { MainStreamInfo, DriverStreamInfo, DataStreamInfo } from "../useVideoRaceDetails.types";

export const getStreamPrettyName = (name: string) => {
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

export interface CollectedStreams {
  defaultStreams: MainStreamInfo[];
  driverStreams: DriverStreamInfo[];
  driverTrackerStream: DataStreamInfo | null;
  dataChannelStream: DataStreamInfo | null;
}
