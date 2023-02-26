export interface BaseGridWindow {
  id: string;
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
  driverId: string;
}

export type GridWindow = MainGridWindow | DriverTrackerGridWindow | DataChannelGridWindow | DriverGridWindow;
