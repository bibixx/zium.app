import { MessagingClient } from "../../../utils/messagingClient";
import { ContractHandler } from "../../../types/Contract";
import { getDataHandler } from "./eventHandlers/getDataHandler";
import { PageToWorkerContract, WorkerToPageContract } from "./timingData.contract";
import { WorkerMessenger } from "./timingData.workerMessenger";
import { dataStore } from "./timingData.store";
import {
  destroyLiveSocketConnection,
  setupLiveSocketConnection,
} from "./eventHandlers/setupLiveSocketConnectionHandler";

dataStore.init();

const messenger = new WorkerMessenger();
const messagingClient = new MessagingClient<WorkerToPageContract>(messenger, "worker-to-page", "page-to-worker", false);
export type WorkerToPageMessagingClient = typeof messagingClient;

onmessage = (e) => {
  messenger.emit("message", e);
};

const setupSocketConnectionWithMessagingClient = (socketUrl: string) => {
  setupLiveSocketConnection(socketUrl, messagingClient);
};
messagingClient.handleContractualRequest("setupSocketConnection", setupSocketConnectionWithMessagingClient);
const destroySocketConnectionWithMessagingClient = () => {
  destroyLiveSocketConnection();
};
messagingClient.handleContractualRequest("destroySocketConnection", destroySocketConnectionWithMessagingClient);

let abortController: AbortController | null = null;
const getDataHandlerWithAbortSignal: ContractHandler<PageToWorkerContract["getData"]> = (searchedTime: number) => {
  abortController?.abort("New request received. Aborting previous request.");
  abortController = new AbortController();

  return getDataHandler(abortController.signal)(searchedTime);
};
messagingClient.handleContractualRequest("getData", getDataHandlerWithAbortSignal);
