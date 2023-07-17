import { EventGenre, RaceEntitlement } from "../../constants/races";

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
  genre: EventGenre;
}

export type StreamsState =
  | { state: "loading" }
  | { state: "error"; error: Error }
  | {
      state: "done";
      streams: StreamsStateData;
      season: number;
      isLive: boolean;
      raceInfo: RaceInfo;
      playbackOffsets: PlaybackOffsets;
      entitlement: RaceEntitlement;
    };

export type StreamsStateAction =
  | { type: "load" }
  | { type: "error"; error: Error }
  | {
      type: "done";
      streams: StreamsStateData;
      season: number;
      isLive: boolean;
      raceInfo: RaceInfo;
      playbackOffsets: PlaybackOffsets;
      entitlement: RaceEntitlement;
    };

export interface BaseStreamInfo {
  channelId: number;
  playbackUrl: string;
  title: string;
  identifier: string;
}

export interface StreamInfo extends BaseStreamInfo {
  type: "main" | "driver-tracker" | "data-channel" | "other";
}

export interface DriverStreamInfo extends BaseStreamInfo {
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

export type StreamInfoWithDriver = StreamInfo | DriverStreamInfo;

export interface BaseStreamDataDTO {
  type: string;
  playbackUrl: string;
  channelId: number;
  title: string;
  reportingName: string;
  default: boolean;
}

export interface DriverStreamDataDTO extends BaseStreamDataDTO {
  teamName: string;
  racingNumber: number;
  identifier: "OBC";
  driverImg: string;
  teamImg: string;
  driverFirstName: string;
  driverLastName: string;
  constructorName: string;
  hex: string;
}
interface OtherStreamDataDTO extends BaseStreamDataDTO {
  identifier: string;
}
export type StreamDataDTO = DriverStreamDataDTO | OtherStreamDataDTO;

export interface F1PlaybackOffsetsApiResponse {
  channels: [string, string];
  channelToAdjust: string;
  delaySeconds: number;
}

export type F1PlaybackOffsetsData = Partial<Record<StreamInfoWithDriver["type"], Record<string, number | undefined>>>;

export interface PlaybackOffsets {
  f1: F1PlaybackOffsetsData;
}
