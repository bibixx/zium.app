import { isWindows } from "./platform";

export function isCmdOnMacOrCtrlOnWinOnMouseEvent(
  event: React.MouseEvent | MouseEvent | React.KeyboardEvent | KeyboardEvent,
) {
  return isWindows ? event.ctrlKey : event.metaKey;
}

export function isOpenInNewWindowLinkClick(event: React.MouseEvent | MouseEvent) {
  const isMiddleButtonClick = event.button === 4;
  return isCmdOnMacOrCtrlOnWinOnMouseEvent(event) || isMiddleButtonClick || event.shiftKey;
}
