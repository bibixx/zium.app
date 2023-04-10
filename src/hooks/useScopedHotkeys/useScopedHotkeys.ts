import { DependencyList, useEffect, useMemo } from "react";
import { Options, useHotkeys, useHotkeysContext } from "react-hotkeys-hook";

export const DEFAULT_SCOPE = "default";
type UseHotkeysParams = Parameters<typeof useHotkeys>;
type Keys = UseHotkeysParams[0];
type HotkeyCallback = UseHotkeysParams[1];

export function useScopedHotkeys(keys: Keys, callback: HotkeyCallback): void;
export function useScopedHotkeys(keys: Keys, callback: HotkeyCallback, arg1: Options): void;
export function useScopedHotkeys(keys: Keys, callback: HotkeyCallback, arg1: DependencyList): void;
export function useScopedHotkeys(keys: Keys, callback: HotkeyCallback, arg1: Options, arg2: DependencyList): void;
export function useScopedHotkeys(keys: Keys, callback: HotkeyCallback, arg1: DependencyList, arg2: Options): void;
export function useScopedHotkeys(
  keys: Keys,
  callback: HotkeyCallback,
  arg1?: Options | DependencyList,
  arg2?: Options | DependencyList,
) {
  const options = useMemo(() => {
    if (isHotkeysOption(arg1)) {
      return arg1;
    }
    if (isHotkeysOption(arg2)) {
      return arg2;
    }

    return undefined;
  }, [arg1, arg2]);
  const dependencies = useMemo(() => {
    if (isDependencyList(arg1)) {
      return arg1;
    }
    if (isDependencyList(arg2)) {
      return arg2;
    }

    return undefined;
  }, [arg1, arg2]);

  const lastOptions = useMemo((): [DependencyList | undefined, Options] => {
    if (options == null) {
      return [dependencies, { scopes: DEFAULT_SCOPE }];
    }

    const clonedOptions = { ...options };
    const scopes = clonedOptions.scopes;

    if (scopes == null) {
      clonedOptions.scopes = DEFAULT_SCOPE;
    }

    return [dependencies, clonedOptions];
  }, [dependencies, options]);

  return useHotkeys(keys, callback, ...lastOptions);
}

function isDependencyList(arg: Options | DependencyList | undefined): arg is DependencyList {
  return Array.isArray(arg);
}

function isHotkeysOption(arg: Options | DependencyList | undefined): arg is Options {
  return arg != null && !Array.isArray(arg);
}

export const useHotkeysScope = (scope?: string) => {
  const { enabledScopes, disableScope, enableScope } = useHotkeysContext();
  const realScope = useMemo(() => scope ?? String(Math.random()), [scope]);

  useEffect(() => {
    const oldEnabledScope = enabledScopes;
    oldEnabledScope.forEach((s) => disableScope(s));

    enableScope(realScope);

    return () => {
      disableScope(realScope);
      oldEnabledScope.forEach((s) => enableScope(s));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return realScope;
};
