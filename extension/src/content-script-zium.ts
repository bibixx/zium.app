import { Alarm } from "./common";
import { F1TVTier, getF1TVTier } from "./utils/getF1TVTier";

const { version } = chrome.runtime.getManifest();

interface MessagesToPage {
  LOGGED_IN: { isLoggedIn: boolean; tier: F1TVTier };
  LOGGED_IN_CHANGED: { isLoggedIn: boolean; tier: F1TVTier };
  ALARMS: string[];
  ALARM_CHANGED: string[];
  VERSION: string;
}

const sendMessageToPage = <T extends keyof MessagesToPage>(type: T, data: MessagesToPage[T]) => {
  window.postMessage({ type, data, source: "extension" }, "*");
};

const isLoggedIn = async () => {
  const { token } = await chrome.storage.local.get("token");
  const tier = getF1TVTier(token);

  return { isLoggedIn: token != null, tier };
};

const getAlarms = async () => {
  const alarmsStorage = (await chrome.storage.local.get("alarms")).alarms as Record<string, Alarm>;

  if (alarmsStorage == null) {
    return [];
  }

  return Object.entries(alarmsStorage)
    .filter(([, value]) => new Date(value.date).getTime() > Date.now())
    .map(([key]) => key);
};

window.addEventListener(
  "message",
  async (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }

    if (event.data.source !== "page") {
      return;
    }

    const type = event.data.type;

    if (type == null || typeof type !== "string") {
      return;
    }

    switch (type) {
      case "VERSION":
        sendMessageToPage(type, version);
        break;
      case "LOGGED_IN":
        sendMessageToPage(type, await isLoggedIn());
        break;
      case "ALARMS":
        sendMessageToPage(type, await getAlarms());
        break;
      default: {
        chrome.runtime.sendMessage({
          type,
          source: "extension",
          data: event.data.data,
        });
        break;
      }
    }
  },
  false,
);

chrome.storage.local.onChanged.addListener(async (changes) => {
  if ("token" in changes) {
    const token = changes.token.newValue;
    const tier = getF1TVTier(token);

    sendMessageToPage("LOGGED_IN_CHANGED", { isLoggedIn: token != null, tier });
  }

  if ("alarms" in changes) {
    sendMessageToPage("ALARM_CHANGED", await getAlarms());
  }
});

export {};
