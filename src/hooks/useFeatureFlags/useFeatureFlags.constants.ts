import { ZodType, z } from "zod";
import type { FlagsObject } from "./useFeatureFlags.types";

const getFlag =
  <Type>() =>
  <Key>(key: Key) =>
  <Validator>(validator: Validator extends ZodType ? (z.output<Validator> extends Type ? Validator : never) : never) =>
    ({ type: key, validator } as { type: Key; _type: Type; validator: Validator });

const BOOLEAN_TYPE = getFlag<boolean>()({ type: "boolean" } as const)(z.boolean().optional().default(false));

export type DebugFlagTypes = typeof BOOLEAN_TYPE;
export const debugFlagTypes = {
  increaseBackgroundContrast: BOOLEAN_TYPE,
  showWindowBorders: BOOLEAN_TYPE,
  forceUiVisibility: BOOLEAN_TYPE,
  disableLiveNotifications: BOOLEAN_TYPE,
  forceTVAccess: BOOLEAN_TYPE,
  showInternationalOffsets: BOOLEAN_TYPE,
  useKidsAvatars: BOOLEAN_TYPE,
} satisfies Record<string, DebugFlagTypes>;

export const defaultFlags = {
  increaseBackgroundContrast: false,
  showWindowBorders: false,
  forceUiVisibility: false,
  disableLiveNotifications: false,
  forceTVAccess: false,
  showInternationalOffsets: false,
  useKidsAvatars: false,
} satisfies FlagsObject;
