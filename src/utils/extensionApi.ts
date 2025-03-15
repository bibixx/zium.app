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

const makeRequest = async <T, U = never>(type: string, data?: U, timeout?: number) => {
  const responsePromise = getResponse<T>(type, timeout);
  sendMessage(type, data);

  const response = await responsePromise;

  return response;
};

export const getVersion = async () => {
  const version = await makeRequest<string>("VERSION", undefined, 100);

  return version;
};

export type F1TVTier = "Pro" | "Access" | "None" | "Premium" | "Unknown";
export type IsLoggedInArgs = { isLoggedIn: boolean; tier: F1TVTier; rawTier?: string | null };
export const getIsLoggedIn = async () => {
  const isLoggedIn = await makeRequest<IsLoggedInArgs>("LOGGED_IN");

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

interface Alarm {
  id: number;
  date: number;
  eventName: string;
  image: string;
}

export const createAlarm = async (alarm: Alarm) => {
  const createAlarmSucceeded = await makeRequest<boolean, Alarm>("CREATE_ALARM", alarm);

  return createAlarmSucceeded;
};

export const deleteAlarm = async (alarmId: number) => {
  const deleteAlarmSucceeded = await makeRequest<boolean, number>("DELETE_ALARM", alarmId);

  return deleteAlarmSucceeded;
};

export const getAlarms = async () => {
  const alarms = await makeRequest<string[]>("ALARMS");

  return alarms;
};

export const listenOnTokenChange = (onChanged: (data: IsLoggedInArgs) => void) => {
  const onEvent = (event: MessageEvent<{ type: string; source: string; data: IsLoggedInArgs }>) => {
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

export const listenOnAlarmChange = (onChanged: (activeAlarmIds: string[]) => void) => {
  const onEvent = (event: MessageEvent<{ type: string; source: string; data: string[] }>) => {
    if (event.source !== window) {
      return;
    }

    if (event.data.type === "ALARM_CHANGED" && event.data.source === "extension") {
      onChanged(event.data.data);
    }
  };

  window.addEventListener("message", onEvent);

  return () => window.removeEventListener("message", onEvent);
};
