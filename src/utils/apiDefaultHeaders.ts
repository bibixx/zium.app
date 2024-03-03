import { isLinux, isMac, isWindows } from "./platform";

const playerVersion = import.meta.env.VITE_BITMOVIN_PLAYER_VERSION;

function getF1DeviceInfo() {
  let os: string = "";
  if (isWindows) {
    os = "windows";
  } else if (isMac) {
    os = "mac os";
  } else if (isLinux) {
    os = "linux";
  }

  let model: string = "";
  if (isMac) {
    model = "Macintosh";
  } else if (isWindows) {
    model = "Windows";
  } else if (isLinux) {
    model = "Linux";
  }

  let osVersion: string = "";
  if (isWindows) {
    osVersion = navigator.userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] ?? "";
  } else if (isMac) {
    osVersion = navigator.userAgent.match(/Mac OS X (\d+_\d+_\d+)/)?.[1] ?? "";
  } else if (isLinux) {
    osVersion = navigator.userAgent.match(/Linux (\d+\.\d+\.\d+)/)?.[1] ?? "";
  }

  const browser = "chrome";
  const browserVersion = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] ?? "";

  const info = {
    device: "web",
    screen: "browser",
    os,
    browser,
    browserVersion,
    model,
    osVersion,
    appVersion: "release-R29.0.3",
    playerVersion,
  };

  return Object.entries(info)
    .map(([key, value]) => `${key}=${value}`)
    .join(";");
}

export const defaultHeaders = new Headers();
defaultHeaders.set("x-f1-device-info", getF1DeviceInfo());
