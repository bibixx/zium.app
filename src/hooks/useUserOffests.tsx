import { MutableRefObject, ReactNode, createContext, useCallback, useContext, useMemo, useRef } from "react";
import { AutoComplete } from "../types/AutoComplete";
import { EventEmitter } from "../utils/EventEmitter";
import { StreamInfo } from "./useVideoRaceDetails/useVideoRaceDetails.types";

export type UserOffsets = Partial<Record<AutoComplete<StreamInfo["type"]>, number>>;
interface UserOffsetsEmitterHandlers {
  change: () => void;
}

export const useUserOffsetsState = () => {
  const offsets = useRef<UserOffsets>({});
  const offsetEmitter = useMemo(() => new EventEmitter<UserOffsetsEmitterHandlers>(), []);

  const updateOffset = useCallback(
    (key: keyof UserOffsets, value: number) => {
      offsets.current = {
        ...offsets.current,
        [key]: value,
      };
      offsetEmitter.emit("change");
    },
    [offsetEmitter],
  );

  return { offsets, offsetEmitter, updateOffset };
};

interface UserOffsetsContextType {
  offsets: MutableRefObject<UserOffsets>;
  updateOffset: (key: keyof UserOffsets, value: number) => void;
  offsetEmitter: EventEmitter<UserOffsetsEmitterHandlers>;
}
const UserOffsetsContext = createContext<UserOffsetsContextType | null>(null);

export const useUserOffsets = (): UserOffsetsContextType => {
  const context = useContext(UserOffsetsContext);

  if (context === null) {
    throw new Error("Using uninitialised UserOffsetsContext");
  }

  return context;
};

interface UserOffsetsProviderProps {
  children: ReactNode;
}
export const UserOffsetsProvider = ({ children }: UserOffsetsProviderProps) => {
  const state = useUserOffsetsState();
  const context = useMemo(() => state, [state]);

  return <UserOffsetsContext.Provider value={context}>{children}</UserOffsetsContext.Provider>;
};
