import { DebugFlagTypes, debugFlagTypes } from "./useFeatureFlags.constants";

type FlagValue<T> = T extends { _type: infer Value } ? Value : never;
type FlagValidator<T> = T extends { validator: infer A } ? A : never;

export type Flags = typeof debugFlagTypes;
export type FlagKeys = keyof Flags;

export type FlagsObject = {
  [K in FlagKeys]: FlagValue<K extends FlagKeys ? DebugFlagTypes & Flags[K] : never>;
};

export type FlagsValidator = {
  [K in FlagKeys]: FlagValidator<K extends FlagKeys ? DebugFlagTypes & Flags[K] : never>;
};
