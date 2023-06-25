import {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AutoComplete } from "../../types/AutoComplete";
import { EventEmitter } from "../../utils/EventEmitter";
import { StreamInfo } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { getInitialOffsets, saveOffsets } from "./useUserOffests.utils";

export type UserOffsets = Partial<Record<AutoComplete<StreamInfo["type"]>, number>>;
interface UserOffsetsEmitterHandlers {
  change: () => void;
}

export const useUserOffsetsState = (raceId: string | undefined) => {
  const offsets = useRef<UserOffsets>(getInitialOffsets(raceId));
  const offsetEmitter = useMemo(() => new EventEmitter<UserOffsetsEmitterHandlers>(), []);

  useEffect(() => {
    offsets.current = getInitialOffsets(raceId);
    offsetEmitter.emit("change");
  }, [offsetEmitter, raceId]);

  const updateOffset = useCallback(
    (key: keyof UserOffsets, value: number) => {
      offsets.current = {
        ...offsets.current,
        [key]: value,
      };
      offsetEmitter.emit("change");
      saveOffsets(raceId, offsets.current);
    },
    [offsetEmitter, raceId],
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
  raceId: string | undefined;
}
export const UserOffsetsProvider = ({ children, raceId }: UserOffsetsProviderProps) => {
  const state = useUserOffsetsState(raceId);
  const context = useMemo(() => state, [state]);

  return <UserOffsetsContext.Provider value={context}>{children}</UserOffsetsContext.Provider>;
};

export const useReactiveUserOffsets = () => {
  const { offsets: offsetsRef, offsetEmitter } = useUserOffsets();
  const [offsets, setOffsets] = useState(offsetsRef.current);

  useEffect(() => {
    const onChange = () => setOffsets(offsetsRef.current);
    offsetEmitter.addEventListener("change", onChange);

    return () => {
      offsetEmitter.removeEventListener("change", onChange);
    };
  }, [offsetEmitter, offsetsRef]);

  return offsets;
};
