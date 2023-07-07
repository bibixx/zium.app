import { z } from "zod";
import { safeJSONParse } from "./safeJSONParse";

export class LocalStorageClient<T extends z.ZodType, DefaultValue> {
  constructor(private key: string, private validator: T, private defaultValue: DefaultValue | (() => DefaultValue)) {}

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
