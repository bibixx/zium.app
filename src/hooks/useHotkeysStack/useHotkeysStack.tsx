import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";
import { DEFAULT_SCOPE } from "../useScopedHotkeys/useScopedHotkeys";

interface HotkeysStackContextData {
  pushStackElement: (allowPropagation: boolean, id: string) => void;
  popStackElement: (id: string) => void;
}
const HotkeysStackContext = createContext<HotkeysStackContextData | null>(null);
HotkeysStackContext.displayName = "HotkeysStackContext";

interface HotkeysStackElement {
  id: string;
  allowPropagation: boolean;
}
export const useHotkeysStackData = () => {
  const [stack, setStack] = useState<HotkeysStackElement[]>([]);
  const pushStackElement = useCallback((allowPropagation: boolean, id: string) => {
    const element: HotkeysStackElement = { id, allowPropagation };

    setStack((prevStack) => [element, ...prevStack]);

    return id;
  }, []);

  const popStackElement = useCallback((id: string) => {
    setStack((prevStack) => prevStack.filter((el) => el.id !== id));
  }, []);

  const stackWithPropagation = useMemo(() => {
    const firstNonPropagatedIndex = stack.findIndex((el) => !el.allowPropagation);

    if (firstNonPropagatedIndex < 0) {
      return [DEFAULT_SCOPE, ...stack.map((el) => el.id)];
    }

    return [DEFAULT_SCOPE, ...stack.slice(0, firstNonPropagatedIndex + 1).map((el) => el.id)];
  }, [stack]);

  return useMemo(
    () => ({
      pushStackElement,
      popStackElement,
      stackWithPropagation,
    }),
    [popStackElement, pushStackElement, stackWithPropagation],
  );
};

export const useHotkeysStackContext = () => {
  const context = useContext(HotkeysStackContext);

  if (context === null) {
    throw new Error("Using uninitialised HotkeysStackContext");
  }

  return context;
};

interface HotkeysStackWithinHotkeysProviderProps {
  children: ReactNode;
}
export const HotkeysStackWithinHotkeysProvider = ({ children }: HotkeysStackWithinHotkeysProviderProps) => {
  const { disableScope, enabledScopes, enableScope } = useHotkeysContext();
  const hotkeysStackData = useHotkeysStackData();

  useEffect(() => {
    enabledScopes.forEach((scope) => {
      disableScope(scope);
    });

    hotkeysStackData.stackWithPropagation.forEach((scope) => {
      enableScope(scope);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableScope, enableScope, hotkeysStackData.stackWithPropagation]);

  return <HotkeysStackContext.Provider value={hotkeysStackData}>{children}</HotkeysStackContext.Provider>;
};

export const useHotkeysStack = (isEnabled: boolean, allowPropagation = true, id?: string) => {
  const randomId = useMemo(() => String(Math.random()), []);
  const scope = useMemo(() => id ?? randomId, [id, randomId]);
  const { popStackElement, pushStackElement } = useHotkeysStackContext();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    pushStackElement(allowPropagation, scope);

    return () => popStackElement(scope);
  }, [allowPropagation, isEnabled, popStackElement, pushStackElement, scope]);

  return scope;
};
