import { Contract } from "../types/Contract";

export type MessagingClientEventListener<T> = (
  event: MessageEvent<{ type: string; source: string; data: T; id?: string }>,
) => void;

export interface Messenger {
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage: (message: any, options?: WindowPostMessageOptions) => void;
}

export class MessagingClient<C extends Record<string, Contract>> {
  constructor(
    private messenger: Messenger,
    private thisProcessSource: string,
    private targetProcessSource: string,
    private strictSourceCheck = false,
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  private originalListenersReferenceMap = new WeakMap<Function, Function>();

  // TODO: Kill me in extensionApi
  public addOnMessageListener = <T>(eventName: string, onEvent: MessagingClientEventListener<T>) => {
    const onInnerEvent: MessagingClientEventListener<T> = (event) => {
      if (this.strictSourceCheck && event.source !== this.messenger) {
        return;
      }

      if (event.data.type === eventName && event.data.source === this.targetProcessSource) {
        onEvent(event);
      }
    };

    this.originalListenersReferenceMap.set(onEvent, onInnerEvent);

    this.messenger.addEventListener("message", onInnerEvent as EventListenerOrEventListenerObject);
  };

  // TODO: Kill me in extensionApi
  public removeOnMessageListener = <T>(onEvent: MessagingClientEventListener<T>) => {
    const innerListener = this.originalListenersReferenceMap.get(onEvent);
    if (innerListener) {
      this.messenger.removeEventListener("message", innerListener as EventListenerOrEventListenerObject);
    }
  };

  private getResponse = <T>(type: string, id: string, timeout?: number) =>
    new Promise<T>((resolve, reject) => {
      const onEvent: MessagingClientEventListener<T> = (event) => {
        if (event.data.id !== id) {
          return;
        }

        resolve(event.data.data);
        this.removeOnMessageListener(onEvent);
      };

      this.addOnMessageListener(type, onEvent);

      if (timeout != null) {
        setTimeout(() => {
          this.removeOnMessageListener(onEvent);
          const error = new Error("Response timed out");

          reject(error);
        }, timeout);
      }
    });

  private sendMessage = <T>(type: string, data: T, id?: string) => {
    return this.messenger.postMessage({ type, data, source: this.thisProcessSource, id }, { targetOrigin: "*" });
  };

  // TODO: Kill me in extensionApi
  public makeRequest = async <TRequest, TResponse>(type: string, data?: TRequest, timeout?: number) => {
    const requestId = String(Math.random());

    const responsePromise = this.getResponse<TResponse>(type, requestId, timeout);
    this.sendMessage(type, data, requestId);

    const response = await responsePromise;

    return response;
  };

  public makeContractualRequest = async <T extends keyof C>(type: T, data: C[T]["request"], timeout?: number) => {
    return this.makeRequest<C[T]["request"], C[T]["response"]>(type as string, data, timeout);
  };

  public handleRequest = <TData, TResponse>(type: string, handler: (data: TData) => TResponse | Promise<TResponse>) => {
    this.addOnMessageListener<TData>(type, async (event) => {
      const response = await handler(event.data.data);
      this.sendMessage<TResponse>(type, response, event.data.id);
    });
  };

  public handleContractualRequest = async <T extends keyof C>(
    type: T,
    handler: (data: C[T]["response"]) => C[T]["request"] | Promise<C[T]["request"]>,
  ) => {
    return this.handleRequest(type as string, handler);
  };
}
