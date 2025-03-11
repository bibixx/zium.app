import { useSignalR } from "../useSignalR/useSignalR";
import { MessageUpdate, MessageInitial } from "../../../types/liveTiming/types/message.type";

type Props = {
  handleInitial: (data: MessageInitial) => void;
  handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
  const { connected } = useSignalR({
    onInitial: (data) => {
      const { carDataZ, positionZ, ...initial } = data;
      handleInitial({
        ...initial,
        carDataZ,
        positionZ,
      });
    },
    onUpdate: (updates) => {
      for (const update of updates) {
        const [key] = Object.keys(update);
        const value = update[key];

        handleUpdate({ [key]: value });
      }
    },
  });

  return { connected };
};
