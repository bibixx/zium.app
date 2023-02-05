export interface BaseGridWindow {
  id: string;
  url: string;
}

export interface MainGridWindow extends BaseGridWindow {
  type: "main";
}

export interface DriverTrackerGridWindow extends BaseGridWindow {
  type: "driver-tracker";
}

export interface DataChannelGridWindow extends BaseGridWindow {
  type: "data-channel";
}

export interface DriverGridWindow extends BaseGridWindow {
  type: "driver";
  firstName: string;
  lastName: string;
  team: string;
  color: string;
  streamIdentifier: string;
}

export type GridWindow =
  | MainGridWindow
  | DriverTrackerGridWindow
  | DataChannelGridWindow
  | DriverGridWindow;
