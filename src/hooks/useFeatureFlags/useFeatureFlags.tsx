import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clearFlags, getInitialFlags, saveFlags, toKebabCase } from "./useFeatureFlags.utils";
import { FlagKeys, FlagsObject } from "./useFeatureFlags.types";

const useFeatureFlagsState = () => {
  const [flags, setFlags] = useState(getInitialFlags());
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    saveFlags(flags);
  }, [flags]);

  const updateFlag = useCallback(function <T extends FlagKeys>(key: T) {
    return (value: FlagsObject[T]) => {
      setFlags((oldFlags) => ({ ...oldFlags, [key]: value }));
    };
  }, []);

  const resetFlags = useCallback(() => {
    clearFlags();
    setFlags(getInitialFlags());
    isFirstRenderRef.current = true;
  }, []);

  return { flags, updateFlag, resetFlags };
};

interface FeatureFlagsContextType {
  flags: FlagsObject;
  updateFlag: <T extends FlagKeys>(key: T) => (value: FlagsObject[T]) => void;
  resetFlags: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);
interface FeatureFlagsProviderProps {
  children: ReactNode;
}
export const FeatureFlagsProvider = ({ children }: FeatureFlagsProviderProps) => {
  const featureFlagsState = useFeatureFlagsState();
  const dataAttributes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(featureFlagsState.flags).map(([key, value]) => [`data-ff-${toKebabCase(key)}`, value]),
      ),
    [featureFlagsState.flags],
  );

  return (
    <FeatureFlagsContext.Provider value={featureFlagsState}>
      <div {...dataAttributes}>{children}</div>
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);

  if (context === null) {
    throw new Error("Using uninitialised FeatureFlagsContext");
  }

  return context;
};
