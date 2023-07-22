import ReactDOM from "react-dom/client";
import "./styles/styles";
import App from "./App";
import { setupSentry } from "./utils/setupSentry";

setupSentry();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
