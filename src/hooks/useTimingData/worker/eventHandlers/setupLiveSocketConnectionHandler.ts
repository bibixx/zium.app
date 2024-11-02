import * as signalR from "@microsoft/signalr";
import { dataStore } from "../timingData.store";
import { decodeCompressedData, getDataRange } from "../timingData.utils";
import { WorkerToPageMessagingClient } from "../timingData.worker";
import { TimingResponseValue, TimingResponse, RawTimingResponse } from "../../useTimingData.validator";
import { hasOwn } from "../../../../utils/hasOwn";

let connection: signalR.HubConnection | null;
export const setupLiveSocketConnection = async (messagingClient: WorkerToPageMessagingClient) => {
  connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Warning)
    .withUrl("https://livetiming.formula1.com/signalrcore?authToken=xxx", {
      transport: signalR.HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .build();

  connection.on("feed", (...rawFeedResponse: unknown[]) => {
    const rawTimingResponse = RawTimingResponse.safeParse(rawFeedResponse);
    if (!rawTimingResponse.success) {
      console.error(rawTimingResponse.error);
      return;
    }

    const [key, value, time] = rawTimingResponse.data;
    const timestamp = new Date(time).getTime();

    let resolvedKey = key;
    let resolvedValue = value;
    if (key.endsWith(".z")) {
      resolvedKey = key.slice(0, -2);
      resolvedValue = decodeCompressedData(value);
    }

    const parsedResult = TimingResponseValue.safeParse({ [resolvedKey]: resolvedValue });
    if (!parsedResult.success) {
      console.error(parsedResult.error);
      return;
    }
    const timingResponse: TimingResponse = [timestamp, parsedResult.data];
    dataStore.data.push(timingResponse);

    const dataRange = getDataRange(dataStore.data);

    if (dataRange) {
      messagingClient.makeContractualRequest("pushDataRange", dataRange);
    }
  });

  connection.start().then(async () => {
    const invocationResult = await connection?.invoke("Subscribe", [
      "Heartbeat",
      "AudioStreams",
      "DriverList",
      "ExtrapolatedClock",
      "RaceControlMessages",
      "SessionInfo",
      "SessionStatus",
      "TeamRadio",
      "TimingAppData",
      "TimingStats",
      "TrackStatus",
      "WeatherData",
      "Position.z",
      "CarData.z",
      "ContentStreams",
      "SessionData",
      "TimingData",
    ]);

    const decompressedResult: typeof invocationResult = {};
    for (const [key, value] of Object.entries(invocationResult)) {
      let resolvedKey = key;
      let resolvedValue = value;
      if (key.endsWith(".z")) {
        resolvedKey = key.slice(0, -2);
        resolvedValue = decodeCompressedData(value);
      }
      if (hasOwn(resolvedValue, "_kf")) {
        delete resolvedValue._kf;
      }
      decompressedResult[resolvedKey] = resolvedValue;
    }

    const parsedResult = TimingResponseValue.safeParse(decompressedResult);
    if (!parsedResult.success) {
      console.error(parsedResult.error);
      return;
    }
    const timingResponse: TimingResponse = [Date.now(), parsedResult.data];
    dataStore.data.push(timingResponse);

    const dataRange = getDataRange(dataStore.data);
    if (dataRange) {
      messagingClient.makeContractualRequest("pushDataRange", dataRange);
    }
  });
};

export const destroyLiveSocketConnection = async () => {
  connection?.stop();
};
