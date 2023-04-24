import { DependencyList, useMemo } from "react";
import { Options, useHotkeys } from "react-hotkeys-hook";

export const DEFAULT_SCOPE = "default";
type UseHotkeysParams = Parameters<typeof useHotkeys>;
type Keys = UseHotkeysParams[0];
type HotkeyCallback = UseHotkeysParams[1];

export function useScopedHotkeys(
  keys: Keys,
  scope: string,
  callback: HotkeyCallback,
  options?: Omit<Options, "scopes">,
  dependencies?: DependencyList,
) {
  const finalOptions = useMemo(
    () => ({
      ...options,
      scopes: scope,
    }),
    [options, scope],
  );

  return useHotkeys(keys, callback, finalOptions, dependencies);
}
