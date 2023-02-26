import { useEffect, useState } from "react";
import { getVersion } from "../utils/extensionApi";

export const useHasCompanion = () => {
  const [state, setState] = useState<"loading" | "noCompanion" | "hasCompanion">("loading");

  useEffect(() => {
    const queryAndUpdate = async () => {
      try {
        await getVersion();
        setState("hasCompanion");
      } catch (error) {
        setState("noCompanion");
      }
    };

    queryAndUpdate();
  }, []);

  return state;
};
