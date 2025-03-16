import ReactDOM from "react-dom/client";
import "./styles/styles";
import App from "./App";
import { setupSentry } from "./utils/setupSentry";
// import { useCarDataStore, usePositionStore, useDataStore } from "./hooks/liveTiming/useStores/useDataStore";

setupSentry();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);

// window.takeSnapshot = () => {
//   console.log({
//     useDataStore: useDataStore.getState(),
//     usePositionStore: usePositionStore.getState(),
//     useCarDataStore: useCarDataStore.getState(),
//   });
// };
