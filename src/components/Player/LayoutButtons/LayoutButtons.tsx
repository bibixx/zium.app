import { Squares2X2Icon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { Dimensions } from "../../../types/Dimensions";
import { GridWindow } from "../../../types/GridWindow";
import { Button } from "../../Button/Button";
import { sizePxToPercent } from "../../RnDWindow/RnDWindow.utils";
import styles from "./LayoutButtons.module.scss";

interface LayoutButtonsProps {
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
}
export const LayoutButtons = ({ usedWindows, createWindow }: LayoutButtonsProps) => {
  const { requestStream } = useStreamPicker();

  const onAddClick = async () => {
    const chosenData = await requestStream("all", usedWindows);
    if (chosenData == null) {
      return;
    }

    const [chosenId, chosenType] = chosenData;
    const newWindow = getNewWindow(chosenId, chosenType);

    if (newWindow == null) {
      return;
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const width = windowWidth / 2;
    const height = width * (9 / 16);
    const x = windowWidth / 2 - width / 2;
    const y = windowHeight / 2 - height / 2;

    const dimensions: Dimensions = {
      width: sizePxToPercent(width, windowWidth),
      height: sizePxToPercent(height, windowHeight),
      x: sizePxToPercent(x, windowWidth),
      y: sizePxToPercent(y, windowHeight),
    };

    createWindow(newWindow, dimensions);
  };

  return (
    <div className={styles.buttonsWrapper}>
      <Button iconLeft={Squares2X2Icon} variant="Tertiary" />
      <Button iconLeft={SquaresPlusIcon} variant="Secondary" onClick={onAddClick}>
        Add video
      </Button>
    </div>
  );
};

function isValidGridWindowType(chosenId: string): chosenId is GridWindow["type"] {
  return ["main", "driver-tracker", "data-channel", "driver"].includes(chosenId);
}

const getNewWindow = (chosenId: string, chosenType: ChosenValueType): GridWindow | null => {
  if (chosenType === "driver") {
    return {
      driverId: chosenId,
      id: "",
      type: "driver",
    };
  }

  if (isValidGridWindowType(chosenId) && chosenId !== "driver") {
    return {
      id: "",
      type: chosenId,
    };
  }

  return null;
};
