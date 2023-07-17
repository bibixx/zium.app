import { create } from "zustand";
import { persist } from "zustand/middleware";
import { flagsZustandStorageOptions } from "./useFeatureFlags.utils";
import { FlagKeys, FlagsObject } from "./useFeatureFlags.types";
import { defaultFlags } from "./useFeatureFlags.constants";

export interface FeatureFlagsStore {
  flags: FlagsObject;
  updateFlag: <T extends FlagKeys>(key: T) => (value: FlagsObject[T]) => void;
  resetFlags: () => void;
}

export const useFeatureFlags = create<FeatureFlagsStore>()(
  persist(
    (set) => ({
      flags: defaultFlags,
      resetFlags: () => {
        set({ flags: defaultFlags });
      },
      updateFlag:
        <T extends FlagKeys>(key: T) =>
        (value: FlagsObject[T]) => {
          set((state) => ({ flags: { ...state.flags, [key]: value } }));
        },
    }),
    flagsZustandStorageOptions<FeatureFlagsStore>(),
  ),
);
