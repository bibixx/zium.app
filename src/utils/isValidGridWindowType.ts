import { DataChannelGridWindow, DriverTrackerGridWindow } from "../types/GridWindow";

type GlobalWindow = DriverTrackerGridWindow | DataChannelGridWindow;
export function isValidGlobalGridWindowType(type: string): type is GlobalWindow["type"] {
  const options: GlobalWindow["type"][] = ["driver-tracker", "data-channel"];

  return (options as string[]).includes(type);
}
