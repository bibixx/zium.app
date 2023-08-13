import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { assertExistence } from "../../utils/assertExistence";

export type PickerType = "global" | "drivers" | "main";
export type ChosenValueType = "driver" | "global" | "main";

export type StreamPickerDataState =
  | {
      isOpen: false;
    }
  | {
      isOpen: true;
      requestModeResolveFunction?: (value: [string, ChosenValueType] | null) => void;
      allowDnD: boolean;
      pickerTypes: PickerType[];
      hiddenEntries: string[];
    };

interface StreamPickerContextType {
  requestStream: (pickerTypes?: PickerType[], hiddenEntries?: string[]) => Promise<[string, ChosenValueType] | null>;
  onCancel: () => void;
  onChoice: (chosenValue: string, elementType: ChosenValueType) => void;
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
    (pickerTypes: PickerType[] = ["global", "drivers"], hiddenEntries: string[] = []) =>
      new Promise<[string, ChosenValueType] | null>((resolve) => {
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
    (chosenValue: string, elementType: ChosenValueType) => {
      if (state.isOpen && state.requestModeResolveFunction != null) {
        state.requestModeResolveFunction([chosenValue, elementType]);
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
