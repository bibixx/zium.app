/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageInitial, MessageUpdate, RecursivePartial } from "../../components/liveTiming/types/message.type";
import { CarData, CarsData, Position, Positions, State } from "../../components/liveTiming/types/state.type";
import { inflate, utcToLocalMs, merge } from "./connectLiveTiming.utils";

const USE_SIMULATOR = true;
const F1_BASE_URL = USE_SIMULATOR ? "http://localhost:8000" : "https://livetiming.formula1.com/signalr/negotiate";
const F1_BASE_WS_URL = USE_SIMULATOR ? "ws://localhost:8000/ws" : "wss://livetiming.formula1.com/signalr/connect";

const SIGNALR_HUB = '[{ "name": "Streaming" }]';

const SIGNALR_SUBSCRIBE = {
  H: "Streaming",
  M: "Subscribe",
  A: [
    [
      "Heartbeat",
      "CarData.z",
      "Position.z",
      "ExtrapolatedClock",
      "TopThree",
      "RcmSeries",
      "TimingStats",
      "TimingAppData",
      "WeatherData",
      "TrackStatus",
      "DriverList",
      "RaceControlMessages",
      "SessionInfo",
      "SessionData",
      "LapCount",
      "TimingData",
      "TeamRadio",
      "PitLaneTimeCollection",
      "ChampionshipPrediction",
    ],
  ],
  I: 1,
};

interface NegotiationResponse {
  ConnectionToken: string;
  cookie: string;
}

class SignalRClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;

  constructor(
    private onInitial: (data: any) => void,
    private onUpdate: (data: any) => void,
  ) {}

  private toCamelCase = (str: string): string => {
    if (str.includes(".")) {
      return str
        .split(".")
        .map((part, index) => {
          if (index === 0) {
            return part.charAt(0).toLowerCase() + part.slice(1);
          } else {
            return part.toUpperCase();
          }
        })
        .join("");
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  private transformObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformObject(item));
    }
    if (obj && typeof obj === "object") {
      const transformed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === "_kf") continue;
        transformed[this.toCamelCase(key)] = this.transformObject(value);
      }
      return transformed;
    }
    return obj;
  };

  private parseMessage = (data: string): { type: "initial" | "update"; data: any } | null => {
    try {
      const msg = JSON.parse(data);

      if (msg.R) {
        return {
          type: "initial",
          data: this.transformObject(msg.R),
        };
      }

      if (msg.M && Array.isArray(msg.M) && msg.M.length > 0) {
        const updates = msg.M.map((update: any) => {
          const category = update.A?.[0];
          const data = update.A?.[1];

          if (!category || !data) {
            return null;
          }

          return { [this.toCamelCase(category)]: this.transformObject(data) };
        }).filter(Boolean);

        if (updates.length === 0) {
          return null;
        }

        return {
          type: "update",
          data: updates,
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to parse message:", error);
      return null;
    }
  };

  private negotiate = async (): Promise<NegotiationResponse> => {
    if (USE_SIMULATOR) {
      return {
        ConnectionToken: "",
        cookie: "",
      };
    }

    const url = new URL(F1_BASE_URL);
    url.searchParams.append("clientProtocol", "1.5");
    url.searchParams.append("connectionData", SIGNALR_HUB);

    const response = await fetch(url.toString());
    const data = await response.json();
    const cookie = response.headers.get("set-cookie") || "";

    return {
      ConnectionToken: data.ConnectionToken,
      cookie,
    };
  };

  private connect = async () => {
    try {
      const negotiation = await this.negotiate();
      const url = new URL(F1_BASE_WS_URL);
      url.searchParams.append("clientProtocol", "1.5");
      url.searchParams.append("transport", "webSockets");
      url.searchParams.append("connectionToken", negotiation.ConnectionToken);
      url.searchParams.append("connectionData", SIGNALR_HUB);

      const ws = new WebSocket(url.toString());

      ws.onopen = () => {
        console.log("SignalR connection established");
        ws.send(JSON.stringify(SIGNALR_SUBSCRIBE));
      };

      ws.onmessage = (event) => {
        const message = this.parseMessage(event.data);
        if (!message) return;

        if (message.type === "initial") {
          this.onInitial(message.data);
        } else {
          this.onUpdate(message.data);
        }
      };

      ws.onclose = () => {
        console.log("SignalR connection closed");
        this.scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error("SignalR connection error:", error);
        this.scheduleReconnect();
      };

      this.ws = ws;
    } catch (error) {
      console.error("Failed to connect to SignalR:", error);
      this.scheduleReconnect();
    }
  };

  private scheduleReconnect = () => {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  };

  public init() {
    this.connect();
  }

  public close() {
    this.ws?.close();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  public getIsConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

type Frame<T> = {
  data: T;
  timestamp: number;
};
const KEEP_BUFFER_SECS = 5;
class Buffer<T> {
  private buffer: Frame<T>[] = [];

  public set = (data: T) => {
    this.buffer = [{ data, timestamp: Date.now() }];
  };

  public push = (update: T) => {
    this.buffer.push({ data: update, timestamp: Date.now() });
  };

  public pushTimed = (update: T, timestamp: number) => {
    this.buffer.push({ data: update, timestamp });
  };

  public latest = (): T | null => {
    const frame = this.buffer[this.buffer.length - 1];
    return frame ? frame.data : null;
  };

  public delayed = (cutoffTime: number) => {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i].timestamp >= cutoffTime) {
        return this.buffer[i].data;
      }
    }

    return null;
  };

  public cleanup = (cutoffTime: number) => {
    const bufferedCutOff = cutoffTime - KEEP_BUFFER_SECS * 1000;

    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i].timestamp < bufferedCutOff) {
        this.buffer.splice(i, 1);
      }
    }
  };

  public maxDelay = (): number => {
    return this.buffer.length > 0 ? Math.floor((Date.now() - this.buffer[0].timestamp) / 1000) : 0;
  };
}

class StatefulBuffer<T> {
  current: T | null = null;
  private buffer: Buffer<T> = new Buffer<T>();

  set = (data: T) => {
    this.current = data;
    this.buffer.set(data);
  };

  push = (update: RecursivePartial<T>) => {
    this.current = merge(this.current ?? {}, update);
    if (this.current) this.buffer.push(this.current);
  };

  pushTimed = (...args: Parameters<Buffer<T>["pushTimed"]>) => this.buffer.pushTimed(...args);
  latest = (...args: Parameters<Buffer<T>["latest"]>) => this.buffer.latest(...args);
  delayed = (...args: Parameters<Buffer<T>["delayed"]>) => this.buffer.delayed(...args);
  cleanup = (...args: Parameters<Buffer<T>["cleanup"]>) => this.buffer.cleanup(...args);
  maxDelay = (...args: Parameters<Buffer<T>["maxDelay"]>) => this.buffer.maxDelay(...args);
}

const UPDATE_MS = 200;
class DataEngine {
  private extrapolatedClockBuffer = new StatefulBuffer();
  private topThreeBuffer = new StatefulBuffer();
  private timingStatsBuffer = new StatefulBuffer();
  private timingAppDataBuffer = new StatefulBuffer();
  private weatherDataBuffer = new StatefulBuffer();
  private trackStatusBuffer = new StatefulBuffer();
  private driverListBuffer = new StatefulBuffer();
  private raceControlMessagesBuffer = new StatefulBuffer();
  private sessionInfoBuffer = new StatefulBuffer();
  private sessionDataBuffer = new StatefulBuffer();
  private lapCountBuffer = new StatefulBuffer();
  private timingDataBuffer = new StatefulBuffer();
  private teamRadioBuffer = new StatefulBuffer();
  private championshipPredictionBuffer = new StatefulBuffer();

  private getBuffersList = () => {
    return [
      ["extrapolatedClock", this.extrapolatedClockBuffer],
      ["topThree", this.topThreeBuffer],
      ["timingStats", this.timingStatsBuffer],
      ["timingAppData", this.timingAppDataBuffer],
      ["weatherData", this.weatherDataBuffer],
      ["trackStatus", this.trackStatusBuffer],
      ["driverList", this.driverListBuffer],
      ["raceControlMessages", this.raceControlMessagesBuffer],
      ["sessionInfo", this.sessionInfoBuffer],
      ["sessionData", this.sessionDataBuffer],
      ["lapCount", this.lapCountBuffer],
      ["timingData", this.timingDataBuffer],
      ["teamRadio", this.teamRadioBuffer],
      ["championshipPrediction", this.championshipPredictionBuffer],
    ] as [string, StatefulBuffer<any>][];
  };

  private carBuffer = new Buffer<CarsData>();
  private posBuffer = new Buffer<Positions>();

  private maxDelay = 0;
  private delay = 0;
  private interval: number | null = null;

  constructor(
    private updateState: (state: State) => void,
    private updatePosition: (position: Positions) => void,
    private updateCarData: (carData: CarsData) => void,
  ) {}

  public init() {
    this.interval = setInterval(() => this.handleCurrentState(), UPDATE_MS);
  }

  public cleanup = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  public setDelay = (delay: number) => {
    this.delay = delay;
  };

  handleInitial = ({ carDataZ, positionZ, ...initial }: MessageInitial) => {
    this.updateState(initial);

    this.getBuffersList().forEach(([key, buffer]) => {
      const data = initial[key as keyof typeof initial];
      if (data) buffer.set(data);
    });

    if (carDataZ) {
      const carData = inflate<CarData>(carDataZ);
      // carDataStore.set(carData.Entries[0].Cars);
      this.updateCarData(carData.Entries[0].Cars);

      for (const entry of carData.Entries) {
        this.carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
      }
    }

    if (positionZ) {
      const position = inflate<Position>(positionZ);
      // positionStore.set(position.Position[0].Entries);
      this.updatePosition(position.Position[0].Entries);

      for (const entry of position.Position) {
        this.posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
      }
    }
  };

  handleUpdate = ({ carDataZ, positionZ, ...update }: MessageUpdate) => {
    this.getBuffersList().forEach(([key, buffer]) => {
      const data = update[key as keyof typeof update];
      if (data) buffer.push(data);
    });

    if (carDataZ) {
      const carData = inflate<CarData>(carDataZ);
      for (const entry of carData.Entries) {
        this.carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
      }
    }

    if (positionZ) {
      const position = inflate<Position>(positionZ);
      for (const entry of position.Position) {
        this.posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
      }
    }
  };

  handleCurrentState = () => {
    const delay = this.delay;

    if (delay === 0) {
      const newStateFrame: State = {} as State;

      this.getBuffersList().forEach(([key, buffer]) => {
        const latest = buffer.latest();
        if (latest) newStateFrame[key as keyof typeof newStateFrame] = latest as any;
      });

      this.updateState(newStateFrame);

      const carFrame = this.carBuffer.latest();
      if (carFrame) this.updateCarData(carFrame);

      const posFrame = this.posBuffer.latest();
      if (posFrame) this.updatePosition(posFrame);
    } else {
      const delayedTimestamp = Date.now() - delay * 1000;

      this.getBuffersList().forEach(([key, buffer]) => {
        const delayed = buffer.delayed(delayedTimestamp);

        if (delayed) this.updateState({ [key]: delayed });

        setTimeout(() => buffer.cleanup(delayedTimestamp), 0);
      });

      const carFrame = this.carBuffer.delayed(delayedTimestamp);
      if (carFrame) {
        this.updateCarData(carFrame);

        setTimeout(() => this.carBuffer.cleanup(delayedTimestamp), 0);
      }

      const posFrame = this.posBuffer.delayed(delayedTimestamp);
      if (posFrame) {
        this.updatePosition(posFrame);

        setTimeout(() => this.posBuffer.cleanup(delayedTimestamp), 0);
      }
    }

    const maxDelay = Math.max(
      ...this.getBuffersList().map(([, buffer]) => buffer.maxDelay()),
      this.carBuffer.maxDelay(),
      this.posBuffer.maxDelay(),
    );

    this.maxDelay = maxDelay;
  };
}

export class ConnectedDataEngine {
  private dataEngine: DataEngine;
  private signalR: SignalRClient;

  constructor(
    updateState: (state: State) => void,
    updatePosition: (position: Positions) => void,
    updateCarData: (carData: CarsData) => void,
  ) {
    this.dataEngine = new DataEngine(updateState, updatePosition, updateCarData);

    const onInitial = (data: any) => {
      const { carDataZ, positionZ, ...initial } = data;
      this.dataEngine.handleInitial({
        ...initial,
        carDataZ,
        positionZ,
      });
    };

    const onUpdate = (updates: any) => {
      for (const update of updates) {
        const [key] = Object.keys(update);
        const value = update[key];

        this.dataEngine.handleUpdate({ [key]: value });
      }
    };

    this.signalR = new SignalRClient(onInitial, onUpdate);
  }

  public init() {
    this.dataEngine.init();
    this.signalR.init();
  }

  public cleanup() {
    this.signalR.close();
    this.dataEngine.cleanup();
  }

  public setDelay = (delay: number) => {
    this.dataEngine.setDelay(delay);
  };
}
