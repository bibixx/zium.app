import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { assertExistence } from "../../utils/assertExistence";
import { DataChannelGridWindow, DriverTrackerGridWindow } from "../../types/GridWindow";

export type PickerType = "data" | "drivers" | "main";
export type ChosenValueType =
  | { type: "main"; streamId: "f1live" }
  | { type: "main"; streamId: "international"; audioLanguage?: string }
  | { type: "data"; streamId: (DriverTrackerGridWindow | DataChannelGridWindow)["type"] }
  | { type: "driver"; driverId: string };

export type StreamPickerDataState =
  | {
      isOpen: false;
    }
  | {
      isOpen: true;
      requestModeResolveFunction?: (value: ChosenValueType | null) => void;
      allowDnD: boolean;
      pickerTypes: PickerType[];
      hiddenEntries: string[];
    };

interface StreamPickerContextType {
  requestStream: (pickerTypes?: PickerType[], hiddenEntries?: string[]) => Promise<ChosenValueType | null>;
  onCancel: () => void;
  onChoice: (chosenValue: ChosenValueType) => void;
  state: StreamPickerDataState;
}
export const StreamPickerContext = createContext<StreamPickerContextType | null>(null);
export const useStreamPicker = () => {
  const context = useContext(StreamPickerContext);
  assertExistence(context, "Using uninitialised StreamPickerContext");

  return context;
};

const useStreamPickerData = (): StreamPickerContextType => {
  const [state, setState] = useState<StreamPickerDataState>({ isOpen: false });

  const requestStream = useCallback(
    (pickerTypes: PickerType[] = ["data", "drivers"], hiddenEntries: string[] = []) =>
      new Promise<ChosenValueType | null>((resolve) => {
        setState({
          isOpen: true,
          allowDnD: false,
          hiddenEntries,
          pickerTypes,
          requestModeResolveFunction: resolve,
        });
      }),
    [],
  );

  const onClose = useCallback(() => {
    setState({
      isOpen: false,
    });
  }, []);

  const onChoice = useCallback(
    (chosenValue: ChosenValueType) => {
      if (state.isOpen && state.requestModeResolveFunction != null) {
        state.requestModeResolveFunction(chosenValue);
        onClose();
        return;
      }
    },
    [onClose, state],
  );

  const onCancel = useCallback(() => {
    if (state.isOpen && state.requestModeResolveFunction != null) {
      state.requestModeResolveFunction(null);
      onClose();
      return;
    }
  }, [onClose, state]);

  return useMemo(
    () => ({
      state,
      requestStream,
      onCancel,
      onChoice,
    }),
    [onCancel, onChoice, requestStream, state],
  );
};

interface StreamPickerProviderProps {
  children: ReactNode;
}
export const StreamPickerProvider = ({ children }: StreamPickerProviderProps) => {
  const value = useStreamPickerData();

  return <StreamPickerContext.Provider value={value}>{children}</StreamPickerContext.Provider>;
};
