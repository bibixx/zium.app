export interface StreamsStateData {
  defaultStream: StreamInfo | null;
  driverTrackerStream: StreamInfo | null;
  dataChannelStream: StreamInfo | null;
  driverStreams: DriverStreamInfo[];
  otherStreams: StreamInfo[];
}

export interface RaceInfo {
  countryName: string;
  countryId: string;
  title: string;
}

export type StreamsState =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; streams: StreamsStateData; season: number; isLive: boolean; raceInfo: RaceInfo };

export type StreamsStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; streams: StreamsStateData; season: number; isLive: boolean; raceInfo: RaceInfo };

export interface StreamInfo {
  type: "main" | "driver-tracker" | "data-channel" | "other";
  channelId: number;
  playbackUrl: string;
  title: string;
  identifier: string;
}

export interface DriverStreamInfo extends Omit<StreamInfo, "type"> {
  type: "driver";
  racingNumber: number;
  title: string;
  reportingName: string;
  driverFirstName: string;
  driverLastName: string;
  teamName: string;
  constructorName: string;
  hex: string;
}

export interface StreamDataDTO {
  racingNumber: number;
  teamName: string;
  type: string;
  playbackUrl: string;
  driverImg: string;
  teamImg: string;
  channelId: number;
  title: string;
  reportingName: string;
  default: boolean;
  identifier: string;
  driverFirstName: string;
  driverLastName: string;
  constructorName: string;
  hex: string;
}
