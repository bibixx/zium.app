import { useEffect } from "react";
import { create } from "zustand";
import { F1TVTier, IsLoggedInArgs, getIsLoggedIn, listenOnTokenChange } from "../utils/extensionApi";
import { useFeatureFlags } from "./useFeatureFlags/useFeatureFlags";

type LoggedInState =
  | {
      type: "loading";
    }
  | {
      type: "loggedOut";
    }
  | {
      type: "loggedIn";
      tier: F1TVTier;
      token: string | null;
    };

interface LoggedInStore {
  state: LoggedInState;
  setState: (state: LoggedInState) => void;
}
const useLoggedInStore = create<LoggedInStore>((set) => ({
  state: { type: "loading" },
  setState: (state) => {
    set({ state });
  },
}));

export const useLoggedInStateExecutor = () => {
  const setState = useLoggedInStore((state) => state.setState);

  useEffect(() => {
    getIsLoggedIn().then(({ isLoggedIn, tier, token }) => {
      setState(isLoggedIn ? { type: "loggedIn", tier, token } : { type: "loggedOut" });
    });

    const onTokenChange = ({ isLoggedIn, tier, token }: IsLoggedInArgs) => {
      setState(isLoggedIn ? { type: "loggedIn", tier, token } : { type: "loggedOut" });
    };

    const cleanup = listenOnTokenChange(onTokenChange);

    return () => {
      cleanup();
    };
  }, [setState]);
};

export const useLoggedInState = () => {
  return useLoggedInStore((state) => state.state);
};

export const useLoggedInStateWithEnsuredLoggedIn = () => {
  return useLoggedInStore((state) => {
    if (state.state.type !== "loggedIn") {
      throw new Error("User is not logged in");
    }

    return state.state;
  });
};

export const useCurrentTier = (): F1TVTier => {
  const forceTVAccess = useFeatureFlags((state) => state.flags.forceTVAccess);
  return useLoggedInStore((state): F1TVTier => {
    if (state.state.type !== "loggedIn") {
      return "None";
    }

    if (forceTVAccess) {
      return "Access";
    }

    return state.state.tier;
  });
};
