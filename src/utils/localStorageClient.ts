import { z } from "zod";
import { PersistOptions } from "zustand/middleware";
import { safeJSONParse } from "./safeJSONParse";

export class LocalStorageClient<T extends z.ZodType, DefaultValue> {
  constructor(
    private key: string,
    private validator: T,
    private defaultValue: DefaultValue | (() => DefaultValue),
  ) {}

  public get(): z.output<T> | DefaultValue {
    const rawItem = localStorage.getItem(this.key);
    const defaultValue = isFunction(this.defaultValue) ? this.defaultValue() : this.defaultValue;

    if (rawItem == null) {
      return defaultValue;
    }

    const parsedItem = safeJSONParse(rawItem);

    const validated = this.validator.safeParse(parsedItem);
    if (!validated.success) {
      this.remove();

      return defaultValue;
    }

    return validated.data;
  }

  public set(value: z.output<T>) {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  public remove() {
    localStorage.removeItem(this.key);
  }
}

function isFunction(data: unknown): data is () => void {
  return typeof data === "function";
}

export const getZustandPersistOptions =
  <StateKey extends string, Validator extends z.ZodType, DefaultValue>(
    stateKey: StateKey,
    storageKey: string,
    validator: Validator,
    defaultValue: DefaultValue | (() => DefaultValue),
    persistOnIntitalize = true,
  ) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<StateKey, any>>(): PersistOptions<T, Record<StateKey, z.output<Validator> | DefaultValue>> => {
    let initialized = false;

    return {
      name: storageKey,
      storage: {
        getItem: (key) => {
          const client = new LocalStorageClient(key, validator, defaultValue);
          const state = { [stateKey]: client.get() } as Record<StateKey, z.output<Validator> | DefaultValue>;

          return { state };
        },
        setItem(key, value) {
          if (!initialized && !persistOnIntitalize) {
            return;
          }

          const client = new LocalStorageClient(key, validator, defaultValue);
          client.set(value["state"][stateKey]);
        },
        removeItem(key) {
          const client = new LocalStorageClient(key, validator, defaultValue);
          client.remove();
        },
      },
      onRehydrateStorage: () => {
        initialized = false;

        return () => {
          initialized = true;
        };
      },
    };
  };
