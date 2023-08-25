import { EventGenre, RaceEntitlement } from "../../constants/races";
import { Response, ResponseAction } from "../../types/Response";

export interface StreamsStateStreamsData {
  defaultStreams: MainStreamInfo[];
  driverTrackerStream: DataStreamInfo | null;
  dataChannelStream: DataStreamInfo | null;
  driverStreams: DriverStreamInfo[];
}

export interface RaceInfo {
  countryName: string;
  countryId: string;
  title: string;
  genre: EventGenre;
}

export interface StreamsStateData {
  streams: StreamsStateStreamsData;
  season: number;
  isLive: boolean;
  raceInfo: RaceInfo;
  playbackOffsets: PlaybackOffsets;
  entitlement: RaceEntitlement;
}

export type StreamsState = Response<StreamsStateData>;
export type StreamsStateAction = ResponseAction<StreamsStateData>;

export interface BaseStreamInfo {
  channelId: number;
  playbackUrl: string;
  title: string;
  identifier: string;
}

export interface MainStreamInfo extends BaseStreamInfo {
  type: "f1live" | "international";
}

export interface DataStreamInfo extends BaseStreamInfo {
  type: "driver-tracker" | "data-channel";
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

export type MainAndGlobalStreamInfo = DataStreamInfo | MainStreamInfo;
export type StreamInfoWithDriver = MainAndGlobalStreamInfo | DriverStreamInfo;

export interface F1PlaybackOffsetsApiResponse {
  channels: [string, string];
  channelToAdjust: string;
  delaySeconds: number;
}

export type F1PlaybackOffsetsData = Partial<Record<StreamInfoWithDriver["type"], Record<string, number | undefined>>>;

export interface PlaybackOffsets {
  f1: F1PlaybackOffsetsData;
}
