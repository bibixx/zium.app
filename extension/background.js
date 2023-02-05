const removeRule = () =>
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2],
  });

const addRule = (token) =>
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2],
    addRules: [
      {
        id: 2,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              value: token,
              operation: "set",
              header: "ascendontoken",
            },
          ],
        },
        condition: {
          urlFilter: "f1tv.formula1.com",
          initiatorDomains: ["localhost", "www.zium.app"],
        },
      },
    ],
  });

const requestLogin = () =>
  new Promise(async (resolve) => {
    const tab = await chrome.tabs.create({
      url: "https://account.formula1.com/#/en/login?redirect=https%3A%2F%2Fwww.formula1.com%2F",
    });

    const onTokenChanged = (token) => {
      if (token == null) {
        return;
      }

      chrome.tabs.remove(tab.id);
      emitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

      resolve(true);
    };

    const onTabClosed = (tabid) => {
      if (tabid !== tab.id) {
        return;
      }

      chrome.tabs.onRemoved.removeListener(onTabClosed);
      emitter.removeEventListener("TOKEN_CHANGED", onTokenChanged);

      resolve(false);
    };

    chrome.tabs.onRemoved.addListener(onTabClosed);

    emitter.addEventListener("TOKEN_CHANGED", onTokenChanged);
  });

class MyEmitter extends EventTarget {
  emit(type, data) {
    const event = new Event(type);
    event.data = data;

    this.dispatchEvent(event);
  }

  tokenChanged(token) {
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

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  (async () => {
    if (msg.source !== "extension") {
      return;
    }

    const type = msg.type;
    switch (type) {
      case "REQUEST_LOGIN": {
        sendResponse(await requestLogin());
        break;
      }
    }
  })();

  return true;
});
