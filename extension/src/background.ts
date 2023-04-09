import { EventEmitter } from "./utils/EventEmitter";
import { parseLoginSession } from "./utils/parseLoginSession";

const { RuleActionType, HeaderOperation } = chrome.declarativeNetRequest;
const TOKEN_STORE_KEY = "token";

interface BackgroundEmitterHandlers {
  TOKEN_CHANGED: (token: string | null) => void;
}
const backgroundEmitter = new EventEmitter<BackgroundEmitterHandlers>();

const removeRule = () =>
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2, 3, 4],
  });

const addRule = (token: string) => {
  const appDomains = import.meta.env.VITE_APP_DOMAINS.split(",").map((d: string) => d.trim());
  const initiatorDomains = appDomains.map((domain) => domain.replace(/^\*\./, ""));

  return chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2, 3, 4],
    addRules: [
      {
        id: 2,
        priority: 1,
        action: {
          type: RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              value: token,
              operation: HeaderOperation.SET,
              header: "ascendontoken",
            },
          ],
        },
        condition: {
          urlFilter: "f1tv.formula1.com",
          initiatorDomains,
        },
      },
      {
        id: 3,
        priority: 1,
        action: {
          type: RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              value: token,
              operation: HeaderOperation.SET,
              header: "ascendontoken",
            },
          ],
        },
        condition: {
          urlFilter: "f1prodlive.akamaized.net",
          initiatorDomains,
        },
      },
      {
        id: 4,
        priority: 1,
        action: {
          type: RuleActionType.BLOCK,
        },
        condition: {
          urlFilter: "licensing.bitmovin.com",
          initiatorDomains,
        },
      },
    ],
  });
};

const requestLogin = () =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    try {
      const tab = await chrome.tabs.create({
        url: "https://account.formula1.com/#/en/login?redirect=https%3A%2F%2Fwww.formula1.com%2F",
      });

      const onTokenChanged = (token: string | null) => {
        if (token === null) {
          return;
        }

        if (tab.id !== undefined) {
          chrome.tabs.remove(tab.id);
        }

        backgroundEmitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

        resolve(true);
      };

      const onTabClosed = (tabid: number) => {
        if (tabid !== tab.id) {
          return;
        }

        chrome.tabs.onRemoved.removeListener(onTabClosed);
        backgroundEmitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

        resolve(false);
      };

      chrome.tabs.onRemoved.addListener(onTabClosed);

      backgroundEmitter.addEventListener("TOKEN_CHANGED", onTokenChanged);
    } catch (error) {
      reject(error);
    }
  });

async function focusOrOpenZium() {
  const [firstTab] = await chrome.tabs.query({ url: ["https://*.zium.app/"] });
  if (firstTab?.id == null) {
    await chrome.tabs.create({
      url: "https://www.zium.app",
    });
    return;
  }

  chrome.tabs.reload(firstTab.id);
  chrome.tabs.update(firstTab.id, { active: true });
}

async function updateToken(token: string | null) {
  await chrome.storage.local.set({ [TOKEN_STORE_KEY]: token });

  if (token === null) {
    removeRule();
  } else {
    addRule(token);
  }

  backgroundEmitter.emit("TOKEN_CHANGED", token);
}

async function checkForCookieOnInstall() {
  const cookie = await chrome.cookies.get({ url: "https://formula1.com", name: "login-session" });
  if (cookie === null) {
    return;
  }

  const encodedLoginSession = cookie.value;
  const subscriptionToken = parseLoginSession(encodedLoginSession);
  await updateToken(subscriptionToken);
}

chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
  (async () => {
    if (msg.source !== "extension") {
      return;
    }

    const type = msg.type;
    switch (type) {
      case "REQUEST_LOGIN": {
        const loginResponse = await requestLogin();
        await focusOrOpenZium();
        sendResponse(loginResponse);
        break;
      }
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(async (details) => {
  checkForCookieOnInstall();

  if (details.reason !== "install") {
    return;
  }

  focusOrOpenZium();
});

chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.name !== "login-session") {
    return;
  }

  if (changeInfo.removed) {
    chrome.storage.local.remove(TOKEN_STORE_KEY);
    return;
  }

  const encodedLoginSession = changeInfo.cookie.value;
  const subscriptionToken = parseLoginSession(encodedLoginSession);
  updateToken(subscriptionToken);
});

export {};
