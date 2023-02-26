import { useEffect, useState } from "react";
import { getIsLoggedIn, listenOnTokenChange } from "../utils/extensionApi";

export const useLoggedInState = () => {
  const [state, setState] = useState<"loading" | "loggedIn" | "loggedOut">("loading");

  useEffect(() => {
    getIsLoggedIn().then((isLoggedIn) => {
      setState(isLoggedIn ? "loggedIn" : "loggedOut");
    });

    const onTokenChange = (isLoggedIn: boolean) => {
      setState(isLoggedIn ? "loggedIn" : "loggedOut");
    };

    const cleanup = listenOnTokenChange(onTokenChange);

    return () => {
      cleanup();
    };
  }, []);

  return state;
};
