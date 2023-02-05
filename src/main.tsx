import ReactDOM from "react-dom/client";
import "./index.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "video.js/dist/video-js.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
