import { MessagingClient, MessagingClientEventListener } from "./messagingClient";

const extensionClient = new MessagingClient(window, "page", "extension", true);

export const getVersion = async () => {
  const version = await extensionClient.makeRequest<string>("VERSION", undefined, 100);

  return version;
};

export type F1TVTier = "Pro" | "Access" | "None";
export type IsLoggedInArgs = { isLoggedIn: boolean; tier: F1TVTier };
export const getIsLoggedIn = async () => {
  const isLoggedIn = await extensionClient.makeRequest<IsLoggedInArgs>("LOGGED_IN");

  return isLoggedIn;
};

export const requestLogin = async () => {
  const logInSucceeded = await extensionClient.makeRequest<boolean>("REQUEST_LOGIN");

  return logInSucceeded;
};

export const logOut = async () => {
  const logOutSucceeded = await extensionClient.makeRequest<boolean>("LOGOUT");

  return logOutSucceeded;
};

interface Alarm {
  id: number;
  date: number;
  eventName: string;
  image: string;
}

export const createAlarm = async (alarm: Alarm) => {
  const createAlarmSucceeded = await extensionClient.makeRequest<boolean, Alarm>("CREATE_ALARM", alarm);

  return createAlarmSucceeded;
};

export const deleteAlarm = async (alarmId: number) => {
  const deleteAlarmSucceeded = await extensionClient.makeRequest<boolean, number>("DELETE_ALARM", alarmId);

  return deleteAlarmSucceeded;
};

export const getAlarms = async () => {
  const alarms = await extensionClient.makeRequest<string[]>("ALARMS");

  return alarms;
};

export const listenOnTokenChange = (onChanged: (data: IsLoggedInArgs) => void) => {
  const onEvent: MessagingClientEventListener<IsLoggedInArgs> = (event) => {
    onChanged(event.data.data);
  };

  extensionClient.addOnMessageListener("LOGGED_IN_CHANGED", onEvent);
  return () => extensionClient.removeOnMessageListener(onEvent);
};

export const listenOnAlarmChange = (onChanged: (activeAlarmIds: string[]) => void) => {
  const onEvent: MessagingClientEventListener<string[]> = (event) => {
    onChanged(event.data.data);
  };

  extensionClient.addOnMessageListener("ALARM_CHANGED", onEvent);
  return () => extensionClient.removeOnMessageListener(onEvent);
};
