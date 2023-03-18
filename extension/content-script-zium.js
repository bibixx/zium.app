const { version } = chrome.runtime.getManifest();

const sendMessageToPage = (type, data) => {
  window.postMessage({ type, data, source: "extension" }, "*");
};

const isLoggedIn = async () => {
  const { token } = await chrome.storage.local.get("token");

  return token != null;
};

const requestLogin = async () =>
  chrome.runtime.sendMessage({
    type: "REQUEST_LOGIN",
    source: "extension",
  });

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

    const returnMessage = (data) => sendMessageToPage(type, data);

    switch (type) {
      case "VERSION":
        returnMessage(version);
        break;
      case "LOGGED_IN":
        returnMessage(await isLoggedIn());
        break;
      case "REQUEST_LOGIN":
        returnMessage(await requestLogin());
        break;
    }
  },
  false,
);

chrome.storage.local.onChanged.addListener((changes) => {
  if (!("token" in changes)) {
    return;
  }

  const token = changes.token.newValue;
  sendMessageToPage("LOGGED_IN_CHANGED", token != null);
});
