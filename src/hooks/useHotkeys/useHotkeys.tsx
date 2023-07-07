import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Key } from "ts-key-enum";
import { BrandedShortcut, MODIFIER_KEYS, mappedKeys } from "./useHotkeys.keys";

interface HotkeysContextType {
  upsertScope: (scope: Scope) => void;
  deleteScope: (scopeId: string) => void;
}
const HotkeysContext = createContext<HotkeysContextType | null>(null);

const useHotkeysContext = (): HotkeysContextType => {
  const context = useContext(HotkeysContext);

  if (context === null) {
    throw new Error("Using uninitialised HotkeysContext");
  }

  return context;
};

interface Hotkey {
  keys: BrandedShortcut;
  action: (e: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
  enableOnFormTags?: boolean;
}
interface Scope {
  id: string;
  hotkeys: Hotkey[];
  allowPropagation?: boolean;
  enabled?: boolean;
}
const useHotkeysContextState = () => {
  const [scopes, setScopes] = useState<Scope[]>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (let i = scopes.length - 1; i >= 0; i--) {
        const scope = scopes[i];
        const allowPropagation = scope.allowPropagation ?? true;
        const isScopeEnabled = scope.enabled ?? true;

        if (!isScopeEnabled) {
          continue;
        }

        for (const hotkey of scope.hotkeys) {
          const keys = hotkey.keys;
          const isHotkeyEnabled = hotkey.enabled ?? true;
          const preventDefault = hotkey.preventDefault ?? false;
          const enableOnFormTags = hotkey.enableOnFormTags ?? false;
          const action = hotkey.action;

          if (!isHotkeyEnabled) {
            continue;
          }

          if (!enableOnFormTags && isEventOnFormTag(e)) {
            continue;
          }

          const shift = keys.includes(Key.Shift);
          const alt = keys.includes(Key.Alt);
          const control = keys.includes(Key.Control);
          const meta = keys.includes(Key.Meta);

          const isKeyPressed = keys.every((key) => {
            if (MODIFIER_KEYS.includes(key)) {
              return true;
            }

            const mappedKey = mappedKeys[key];
            if (mappedKey != null && mappedKey.toLocaleLowerCase() === e.key.toLocaleLowerCase()) {
              return true;
            }

            return key.toLocaleLowerCase() === e.key.toLocaleLowerCase();
          });

          const shouldActivate =
            isKeyPressed && shift === e.shiftKey && alt === e.altKey && control === e.ctrlKey && meta === e.metaKey;

          if (!shouldActivate) {
            continue;
          }

          if (preventDefault) {
            e.preventDefault();
          }

          console.log(scope);
          action(e);
        }

        if (!allowPropagation) {
          break;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [scopes]);

  const upsertScope = useCallback((newScope: Scope) => {
    setScopes((oldScopes) => {
      const scopeWithIdExists = oldScopes.some(({ id }) => id === newScope.id);

      if (scopeWithIdExists) {
        return oldScopes.map((oldScope) => (oldScope.id === newScope.id ? newScope : oldScope));
      }

      return [...oldScopes, newScope];
    });
  }, []);

  const deleteScope = useCallback((scopeId: string) => {
    setScopes((oldScopes) => oldScopes.filter((oldScope) => oldScope.id !== scopeId));
  }, []);

  return { upsertScope, deleteScope };
};

interface HotkeysProviderProps {
  children: ReactNode;
}
export const HotkeysProvider = ({ children }: HotkeysProviderProps) => {
  const state = useHotkeysContextState();
  const context = useMemo(() => state, [state]);

  return <HotkeysContext.Provider value={context}>{children}</HotkeysContext.Provider>;
};

export const useHotkeys = (getScope: () => Omit<Scope, "id"> & { id?: Scope["id"] }, deps: unknown[] | undefined) => {
  const { deleteScope, upsertScope } = useHotkeysContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedScope = useMemo(getScope, deps ?? []);
  const randomId = useMemo(() => String(Math.random()), []);

  useEffect(() => {
    const isScopedEnabled = memoizedScope.enabled ?? true;
    const id = memoizedScope.id ?? randomId;

    if (isScopedEnabled) {
      upsertScope({ ...memoizedScope, id });
    } else {
      deleteScope(id);
    }

    return () => deleteScope(id);
  }, [deleteScope, memoizedScope, randomId, upsertScope]);
};

const isEventOnFormTag = (e: KeyboardEvent) => {
  const { target } = e;
  const targetTagName = target && (target as HTMLElement).tagName;

  if (targetTagName == null) {
    return false;
  }

  return ["input", "textarea", "select"].includes(targetTagName);
};
