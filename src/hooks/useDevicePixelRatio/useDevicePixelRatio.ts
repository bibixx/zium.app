import { useState, useEffect } from "react";

export function useDevicePixelRatio() {
  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

  useEffect(() => {
    const updatePixelRatio = () => setDevicePixelRatio(window.devicePixelRatio);
    const query = matchMedia(
      `(resolution: ${devicePixelRatio}dppx), (-webkit-device-pixel-ratio: ${devicePixelRatio})`,
    );

    query.addEventListener("change", updatePixelRatio);

    return () => query.removeEventListener("change", updatePixelRatio);
  }, [devicePixelRatio]);

  return devicePixelRatio;
}
