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
import { MainAndGlobalStreamInfo } from "../useVideoRaceDetails/useVideoRaceDetails.types";
import { getInitialOffsets, saveOffsets } from "./useUserOffests.utils";

export type UserOffsets = {
  isUserDefined: boolean;
  lastAppliedZiumOffsets: number | null;
  additionalStreams: Partial<Record<AutoComplete<MainAndGlobalStreamInfo["type"]>, number>>;
};

interface UserOffsetsEmitterHandlers {
  change: () => void;
}

export const useUserOffsetsState = (raceId: string | undefined) => {
  const offsets = useRef<UserOffsets | null>(getInitialOffsets(raceId));

  const offsetEmitter = useMemo(() => {
    const emitter = new EventEmitter<UserOffsetsEmitterHandlers>();
    emitter.setMaxListeners(30);

    return emitter;
  }, []);

  useEffect(() => {
    offsets.current = getInitialOffsets(raceId);
    offsetEmitter.emit("change");
  }, [offsetEmitter, raceId]);

  const updateOffset = useCallback(
    (key: keyof UserOffsets["additionalStreams"], value: number, isUserDefined = true) => {
      const oldOffsets: UserOffsets = offsets.current ?? {
        isUserDefined,
        additionalStreams: {},
        lastAppliedZiumOffsets: null,
      };

      oldOffsets.isUserDefined = isUserDefined;
      oldOffsets.additionalStreams = {
        ...oldOffsets.additionalStreams,
        [key]: value,
      };

      offsets.current = oldOffsets;

      offsetEmitter.emit("change");
      saveOffsets(raceId, offsets.current);
    },
    [offsetEmitter, raceId],
  );

  const overrideOffsets = useCallback(
    (value: UserOffsets) => {
      offsets.current = value;

      offsetEmitter.emit("change");
      saveOffsets(raceId, offsets.current);
    },
    [offsetEmitter, raceId],
  );

  return { offsets, offsetEmitter, updateOffset, overrideOffsets };
};

interface UserOffsetsContextType {
  offsets: MutableRefObject<UserOffsets | null>;
  updateOffset: (key: keyof UserOffsets["additionalStreams"], value: number) => void;
  overrideOffsets: (value: UserOffsets) => void;
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
