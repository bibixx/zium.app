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
  | { state: "error"; error: Error }
  | {
      state: "done";
      streams: StreamsStateData;
      season: number;
      isLive: boolean;
      raceInfo: RaceInfo;
      playbackOffsets: PlaybackOffsets;
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

export interface F1PlaybackOffsetsApiResponse {
  channels: [string, string];
  channelToAdjust: string;
  delaySeconds: number;
}

export type F1PlaybackOffsetsData = Partial<Record<StreamInfoWithDriver["type"], Record<string, number | undefined>>>;

export interface MultiViewerSyncOffsetsResponse {
  diff: 0;
  playbackData: {
    currentTime: number;
    paused: boolean;
    startTimestamp: string;
    ts: number;
  };
  streamData: {
    channelId: number;
    contentId: string;
    meetingKey: string;
    sessionKey: string;
    title: string;
    type: string;
  };
  driverData?: {
    driverNumber: number;
    firstName: string;
    lastName: string;
    teamName: string;
    tla: string;
  };
}

export interface PlaybackOffsets {
  f1: F1PlaybackOffsetsData;
}
