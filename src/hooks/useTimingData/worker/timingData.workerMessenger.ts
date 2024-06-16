import EventEmitter2 from "eventemitter2";
import type { Messenger } from "../../../utils/messagingClient";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WorkerMessenger implements Messenger {
  private emitter = new EventEmitter2();

  emit = (type: string, data: any) => {
    this.emitter.emit(type, data);
  };

  addEventListener = (type: string, listener: EventListenerOrEventListenerObject) =>
    this.emitter.addListener(type, listener as unknown as any);

  removeEventListener = (type: string, listener: EventListenerOrEventListenerObject) =>
    this.emitter.removeListener(type, listener as unknown as any);

  postMessage = (message: any, options?: WindowPostMessageOptions | undefined) => {
    postMessage(message, options);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
