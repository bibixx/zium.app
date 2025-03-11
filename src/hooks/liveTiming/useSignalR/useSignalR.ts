/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

const USE_SIMULATOR = false;
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

type Props = {
  onInitial: (data: any) => void;
  onUpdate: (data: any) => void;
};

export const useSignalR = ({ onInitial, onUpdate }: Props) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const toCamelCase = (str: string): string => {
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

  const transformObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => transformObject(item));
    }
    if (obj && typeof obj === "object") {
      const transformed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === "_kf") continue;
        transformed[toCamelCase(key)] = transformObject(value);
      }
      return transformed;
    }
    return obj;
  };

  const parseMessage = (data: string): { type: "initial" | "update"; data: any } | null => {
    try {
      const msg = JSON.parse(data);

      if (msg.R) {
        return {
          type: "initial",
          data: transformObject(msg.R),
        };
      }

      if (msg.M && Array.isArray(msg.M) && msg.M.length > 0) {
        const updates = msg.M.map((update: any) => {
          const category = update.A?.[0];
          const data = update.A?.[1];

          if (!category || !data) {
            return null;
          }

          return { [toCamelCase(category)]: transformObject(data) };
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

  const negotiate = async (): Promise<NegotiationResponse> => {
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

  const connect = async () => {
    try {
      const negotiation = await negotiate();
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
        const message = parseMessage(event.data);
        if (!message) return;

        if (message.type === "initial") {
          onInitial(message.data);
        } else {
          onUpdate(message.data);
        }
      };

      ws.onclose = () => {
        console.log("SignalR connection closed");
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error("SignalR connection error:", error);
        scheduleReconnect();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect to SignalR:", error);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000);
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};
