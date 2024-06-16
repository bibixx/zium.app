import { addMilliseconds } from "date-fns";
import { parseTimeOffset } from "../../../../utils/parseTimeOffset";
import { safeJSONParse } from "../../../../utils/safeJSONParse";
import { TimingRoot } from "../../useTimingData.validator";
import { dataStore } from "../timingData.store";
import { extractTime, getDataRange, updateState } from "../timingData.utils";
import { WorkerToPageMessagingClient } from "../timingData.worker";

export const setupSocketConnection = async (messagingClient: WorkerToPageMessagingClient) => {
  return setupReplaySocketConnection(messagingClient);
};

export const setupReplaySocketConnection = async (messagingClient: WorkerToPageMessagingClient) => {
  const baseUrl = "https://livetiming.formula1.com/static/2024/2024-05-19_Emilia_Romagna_Grand_Prix/2024-05-19_Race/";

  const files = [
    "CarData.z",
    "DriverList",
    "ExtrapolatedClock",
    "Heartbeat",
    "LapCount",
    "Position.z",
    "RaceControlMessages",
    "SessionData",
    "SessionInfo",
    "TeamRadio",
    "TimingAppData",
    "TimingData",
    "TimingStats",
    "TopThree",
    "TrackStatus",
    "WeatherData",
  ];

  const dataPromises = files.map((file) => fetch(baseUrl + file + ".jsonStream").then((response) => response.text()));
  const data = await Promise.all(dataPromises);

  const actionsToPush = [];
  let start = null;

  for (let i = 0; i < data.length; i++) {
    const actions = data[i];
    const category = files[i];

    const actionsSplit = actions.trim().split("\n");

    let success = false;
    const s = new Date("2024-05-19T12:07:56.7653396Z");

    for (let j = 0; j < actionsSplit.length; j++) {
      const line = actionsSplit[j];
      const jsonStart = category.endsWith(".z") ? line.indexOf('"') : line.indexOf("{");

      const time = addMilliseconds(s, parseTimeOffset(line.substring(0, jsonStart))).toISOString();
      const actionData = line.substring(jsonStart);

      const action = { A: [category, safeJSONParse(actionData), time] };

      if (j === 0) {
        start = updateState(start, { M: [action] });
      } else if (!success) {
        start = updateState(start, { M: [action] });
      } else {
        actionsToPush.push(action);
      }

      if (!success && TimingRoot.partial().safeParse(start).success) {
        success = true;
      }
    }
  }

  dataStore.data.push({
    R: start,
  });

  for (const a of actionsToPush) {
    dataStore.data.push({ M: [a] });
  }

  dataStore.data.sort((a, b) => {
    const timeA = extractTime(a);
    const timeB = extractTime(b);

    if (timeA == null || timeB == null) {
      return 0;
    }

    return timeA - timeB;
  });

  const dataRange = getDataRange(dataStore.data);
  if (dataRange) {
    messagingClient.makeContractualRequest("pushDataRange", dataRange);
  }
};
