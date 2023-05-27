import classNames from "classnames";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const useDebugState = () => {
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

const DebugPickerContext = createContext<boolean | null>(null);
interface DebugProviderProps {
  children: ReactNode;
}
export const DebugProvider = ({ children }: DebugProviderProps) => {
  const isDebugMode = useDebugState();

  return (
    <DebugPickerContext.Provider value={isDebugMode}>
      <div className={classNames({ debug: isDebugMode })}>{children}</div>
    </DebugPickerContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugPickerContext);

  if (context === null) {
    throw new Error("Using uninitialised DebugPickerContext");
  }

  return context;
};
