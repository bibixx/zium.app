import { createContext, ReactNode, useContext, useState } from "react";

type PickerType = "all" | "drivers";
export type ChosenValueType = "driver" | "global";

export type StreamPickerDataState =
  | {
      isOpen: false;
    }
  | {
      isOpen: true;
      requestModeResolveFunction?: (value: [string, ChosenValueType] | null) => void;
      allowDnD: boolean;
      pickerType: PickerType;
      hiddenEntries: string[];
    };

interface StreamPickerContextType {
  requestStream: (pickerType?: PickerType, hiddenEntries?: string[]) => Promise<[string, ChosenValueType] | null>;
  onCancel: () => void;
  onChoice: (chosenValue: string, elementType: ChosenValueType) => void;
  state: StreamPickerDataState;
}
export const StreamPickerContext = createContext<StreamPickerContextType | null>(null);
export const useStreamPicker = () => {
  const context = useContext(StreamPickerContext);

  if (context === null) {
    throw new Error("Using uninitialised StreamPickerContext");
  }

  return context;
};

const useStreamPickerData = (): StreamPickerContextType => {
  const [state, setState] = useState<StreamPickerDataState>({ isOpen: false });

  const requestStream = (pickerType: PickerType = "all", hiddenEntries: string[] = []) =>
    new Promise<[string, ChosenValueType] | null>((resolve) => {
      setState({
        isOpen: true,
        allowDnD: false,
        hiddenEntries,
        pickerType,
        requestModeResolveFunction: resolve,
      });
    });

  const onClose = () => {
    setState({
      isOpen: false,
    });
  };

  const onChoice = (chosenValue: string, elementType: ChosenValueType) => {
    if (state.isOpen && state.requestModeResolveFunction != null) {
      state.requestModeResolveFunction([chosenValue, elementType]);
      onClose();
      return;
    }
  };

  const onCancel = () => {
    if (state.isOpen && state.requestModeResolveFunction != null) {
      state.requestModeResolveFunction(null);
      onClose();
      return;
    }
  };

  return { state, requestStream, onCancel, onChoice };
};

interface StreamPickerProviderProps {
  children: ReactNode;
}
export const StreamPickerProvider = ({ children }: StreamPickerProviderProps) => {
  const value = useStreamPickerData();

  return <StreamPickerContext.Provider value={value}>{children}</StreamPickerContext.Provider>;
};
