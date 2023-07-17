import { getZustandPersistOptions } from "../../utils/localStorageClient";
import { defaultFlags } from "./useFeatureFlags.constants";
import { flagsValidator } from "./useFeatureFlags.validator";

const FLAGS_LOCAL_STORAGE_KEY = "flags";

export const flagsZustandStorageOptions = getZustandPersistOptions(
  "flags",
  FLAGS_LOCAL_STORAGE_KEY,
  flagsValidator,
  defaultFlags,
  false,
);

export const toKebabCase = (text: string) =>
  text.replace(/^[A-Z]/, (match) => match.toLowerCase()).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
