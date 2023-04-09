/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter2 from "eventemitter2";

type Fn = (...args: never[]) => void;

export class EventEmitter<
  Handlers extends Record<Events, Fn>,
  Events extends Extract<keyof Handlers, string> = Extract<keyof Handlers, string>,
> {
  private emitter = new EventEmitter2();

  addEventListener<E extends Events>(type: E, cb: Handlers[E]) {
    return this.emitter.addListener(type, cb as any);
  }

  removeEventListener<E extends Events>(type: E, cb?: Handlers[E]) {
    if (cb === undefined) {
      return this.emitter.removeAllListeners(type);
    }

    return this.emitter.removeListener(type, cb as any);
  }

  emit<E extends Events>(type: E, ...data: Parameters<Handlers[E]>) {
    this.emitter.emit(type, ...data);
  }
}
