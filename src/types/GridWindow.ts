export interface BaseGridWindow {
  id: string;
}

export interface F1TVMainGridWindow extends BaseGridWindow {
  type: "main";
  streamId: "f1live";
}
export interface InternationalMainGridWindow extends BaseGridWindow {
  type: "main";
  streamId: "international";
  audioLanguage?: string;
}
export type MainGridWindow = F1TVMainGridWindow | InternationalMainGridWindow;

export interface DriverTrackerGridWindow extends BaseGridWindow {
  type: "driver-tracker";
}

export interface DataChannelGridWindow extends BaseGridWindow {
  type: "data-channel";
}

export interface DriverGridWindow extends BaseGridWindow {
  type: "driver";
  driverId: string;
}

export interface LiveTimingGridWindow extends BaseGridWindow {
  type: "live-timing";
  dataType: "leaderboard" | "map";
}

export type GridWindow =
  | MainGridWindow
  | DriverTrackerGridWindow
  | DataChannelGridWindow
  | DriverGridWindow
  | LiveTimingGridWindow;

export type GridWindowType = GridWindow["type"];
