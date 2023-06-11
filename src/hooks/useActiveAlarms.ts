import { useEffect, useState } from "react";
import { getAlarms, listenOnAlarmChange } from "../utils/extensionApi";

export const useActiveAlarms = () => {
  const [activeAlarms, setActiveAlarms] = useState<string[]>([]);

  useEffect(() => {
    getAlarms().then((activeAlarms) => {
      setActiveAlarms(activeAlarms);
    });

    const onChange = (activeAlarms: string[]) => {
      setActiveAlarms(activeAlarms);
    };

    const cleanup = listenOnAlarmChange(onChange);

    return () => {
      cleanup();
    };
  }, []);

  return activeAlarms;
};
