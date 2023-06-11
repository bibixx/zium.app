import { Alarm } from "./common";

const { version } = chrome.runtime.getManifest();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendMessageToPage = (type: any, data: any) => {
  window.postMessage({ type, data, source: "extension" }, "*");
};

const isLoggedIn = async () => {
  const { token } = await chrome.storage.local.get("token");

  return token != null;
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

    if (type == null) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const returnMessage = (data: any) => sendMessageToPage(type, data);

    switch (type) {
      case "VERSION":
        returnMessage(version);
        break;
      case "LOGGED_IN":
        returnMessage(await isLoggedIn());
        break;
      case "ALARMS":
        returnMessage(await getAlarms());
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
    sendMessageToPage("LOGGED_IN_CHANGED", token != null);
  }

  if ("alarms" in changes) {
    sendMessageToPage("ALARM_CHANGED", await getAlarms());
  }
});

export {};
