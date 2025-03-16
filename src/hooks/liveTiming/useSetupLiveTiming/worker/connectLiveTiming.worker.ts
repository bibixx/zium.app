import { State, Positions, CarsData } from "../../../../components/liveTiming/types/state.type";
import { ConnectedDataEngine } from "./connectLiveTiming";

let engine: ConnectedDataEngine | null = null;

// Handle messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case "init":
      if (!engine) {
        engine = new ConnectedDataEngine(
          // Update state handler
          (state: State) => {
            self.postMessage({ type: "updateState", payload: state });
          },
          // Update position handler
          (position: Positions) => {
            self.postMessage({ type: "updatePosition", payload: position });
          },
          // Update car data handler
          (carData: CarsData) => {
            self.postMessage({ type: "updateCarData", payload: carData });
          },
        );
        engine.init();
      }
      break;

    case "cleanup":
      if (engine) {
        engine.cleanup();
        engine = null;
      }
      break;

    case "setDelay":
      if (engine && typeof payload === "number") {
        engine.setDelay(payload);
      }
      break;

    default:
      console.warn("Unknown message type:", type);
  }
};

// Handle worker cleanup
self.addEventListener("unload", () => {
  if (engine) {
    engine.cleanup();
    engine = null;
  }
});

// Export empty type for TypeScript
export type {};
