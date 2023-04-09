import { EventEmitter } from "./utils/EventEmitter";

const { RuleActionType, HeaderOperation } = chrome.declarativeNetRequest;

const removeRule = () =>
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2, 3, 4],
  });

const addRule = (token: string) =>
  chrome.declarativeNetRequest.updateDynamicRules({
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
          initiatorDomains: ["localhost", "www.zium.app", "f1-bibixx.vercel.app"],
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
          initiatorDomains: ["localhost", "www.zium.app", "f1-bibixx.vercel.app"],
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
          initiatorDomains: ["localhost", "www.zium.app", "f1-bibixx.vercel.app"],
        },
      },
    ],
  });

const requestLogin = () =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    try {
      const tab = await chrome.tabs.create({
        url: "https://account.formula1.com/#/en/login?redirect=https%3A%2F%2Fwww.formula1.com%2F",
      });

      const onTokenChanged = (token: string) => {
        if (token == null) {
          return;
        }

        if (tab.id !== undefined) {
          chrome.tabs.remove(tab.id);
        }

        emitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

        resolve(true);
      };

      const onTabClosed = (tabid: number) => {
        if (tabid !== tab.id) {
          return;
        }

        chrome.tabs.onRemoved.removeListener(onTabClosed);
        emitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

        resolve(false);
      };

      chrome.tabs.onRemoved.addListener(onTabClosed);

      emitter.addEventListener("TOKEN_CHANGED", onTokenChanged);
    } catch (error) {
      reject(error);
    }
  });

interface MyEmitterHandlers {
  TOKEN_CHANGED: (token: string) => void;
}
class MyEmitter extends EventEmitter<MyEmitterHandlers> {
  tokenChanged(token: string) {
    this.emit("TOKEN_CHANGED", token);
  }
}
const emitter = new MyEmitter();

chrome.storage.local.onChanged.addListener((changes) => {
  if (!("token" in changes)) {
    return;
  }

  const token = changes.token.newValue;
  if (token == null) {
    removeRule();
  } else {
    addRule(token);
  }

  emitter.tokenChanged(token);
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
  if (details.reason !== "install") {
    return;
  }

  focusOrOpenZium();
});

export {};
