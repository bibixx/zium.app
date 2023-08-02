import { MainGridWindow } from "../types/GridWindow";

export function isValidMainGridWindowStreamId(streamId: string): streamId is MainGridWindow["streamId"] {
  const options: MainGridWindow["streamId"][] = ["f1tv", "international"];

  return (options as string[]).includes(streamId);
}
