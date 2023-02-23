import { useEffect, useState } from "react";

export const useDebug = () => {
  const [isDebug, setIsDebug] = useState(localStorage.getItem("debug") === "true");

  useEffect(() => {
    localStorage.setItem("debug", JSON.stringify(isDebug));
  }, [isDebug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        setIsDebug((d) => !d);
      }
    };

    document.addEventListener("keydown", onKey, { capture: true });

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return isDebug;
};
