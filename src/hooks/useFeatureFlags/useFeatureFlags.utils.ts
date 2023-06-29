import { safeJSONParse } from "../../utils/safeJSONParse";
import { defaultFlags } from "./useFeatureFlags.constants";
import { FlagsObject } from "./useFeatureFlags.types";
import { flagsValidator } from "./useFeatureFlags.validator";

const FLAGS_LOCAL_STORAGE_KEY = "flags";

export const getInitialFlags = (): FlagsObject => {
  const flags = localStorage.getItem(FLAGS_LOCAL_STORAGE_KEY);
  if (flags === null) {
    return defaultFlags;
  }

  const parsedFlags = safeJSONParse(flags);
  const validatedFlags = flagsValidator.safeParse(parsedFlags);

  if (!validatedFlags.success) {
    return defaultFlags;
  }

  return validatedFlags.data;
};

export const saveFlags = (flags: FlagsObject) => {
  localStorage.setItem(FLAGS_LOCAL_STORAGE_KEY, JSON.stringify(flags));
};

export const clearFlags = () => {
  localStorage.removeItem(FLAGS_LOCAL_STORAGE_KEY);
};

export const toKebabCase = (text: string) =>
  text.replace(/^[A-Z]/, (match) => match.toLowerCase()).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
