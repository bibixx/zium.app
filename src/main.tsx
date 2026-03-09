import ReactDOM from "react-dom/client";
import "./styles/styles";
import App from "./App";
import { setupPostHog } from "./utils/setupPostHog";
import "./utils/whatInput";

setupPostHog();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
