const getResponse = <T>(type: string, timeout?: number) =>
  new Promise<T>((resolve, reject) => {
    const onEvent = (event: MessageEvent<{ type: string; source: string; data: T }>) => {
      if (event.source !== window) {
        return;
      }

      if (event.data.type === type && event.data.source === "extension") {
        resolve(event.data.data);
        window.removeEventListener("message", onEvent);
      }
    };

    window.addEventListener("message", onEvent);

    if (timeout != null) {
      setTimeout(() => {
        window.removeEventListener("message", onEvent);
        const error = new Error("Response timed out");

        reject(error);
      }, timeout);
    }
  });

const sendMessage = <T>(type: string, data: T) => window.postMessage({ type, data, source: "page" }, "*");

const makeRequest = async <T>(type: string, data?: T, timeout?: number) => {
  const responsePromise = getResponse<T>(type, timeout);
  sendMessage(type, data);

  const response = await responsePromise;

  return response;
};

export const getVersion = async () => {
  const version = await makeRequest<string>("VERSION", undefined, 100);

  return version;
};

export const getIsLoggedIn = async () => {
  const isLoggedIn = await makeRequest<boolean>("LOGGED_IN");

  return isLoggedIn;
};

export const requestLogin = async () => {
  const logInSucceeded = await makeRequest<boolean>("REQUEST_LOGIN");

  return logInSucceeded;
};

export const logOut = async () => {
  const logOutSucceeded = await makeRequest<boolean>("LOGOUT");

  return logOutSucceeded;
};

export const listenOnTokenChange = (onChanged: (isLoggedIn: boolean) => void) => {
  const onEvent = (event: MessageEvent<{ type: string; source: string; data: boolean }>) => {
    if (event.source !== window) {
      return;
    }

    if (event.data.type === "LOGGED_IN_CHANGED" && event.data.source === "extension") {
      onChanged(event.data.data);
    }
  };

  window.addEventListener("message", onEvent);

  return () => window.removeEventListener("message", onEvent);
};
