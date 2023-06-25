import { GridWindowType } from "../types/GridWindow";

export function isValidGridWindowType(type: string): type is GridWindowType {
  return ["main", "driver-tracker", "data-channel", "driver"].includes(type);
}
