import { Squares2X2Icon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { Dimensions } from "../../../types/Dimensions";
import { GridWindow } from "../../../types/GridWindow";
import { quote } from "../../../utils/text";
import { Button } from "../../Button/Button";
import { Dropdown, DropdownSection } from "../../Dropdown/Dropdown";
import { sizePxToPercent } from "../../RnDWindow/RnDWindow.utils";
import { LayoutDialogs } from "../LayoutDialogs/LayoutDialogs";
import { LayoutDialogState } from "../LayoutDialogs/LayoutDialogs.types";
import styles from "./LayoutButtons.module.scss";

interface LayoutButtonsProps {
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
}
export const LayoutButtons = ({ usedWindows, createWindow }: LayoutButtonsProps) => {
  const { requestStream } = useStreamPicker();
  const [layoutDialogState, setLayoutDialogState] = useState<LayoutDialogState>({ type: "closed" });
  const onCancel = useCallback(() => setLayoutDialogState({ type: "closed" }), []);

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

  const scope = useHotkeysStack(true, true, "LayoutButtons");
  useScopedHotkeys("shift+n", scope, onAddClick);

  const dropdownOptions = useCallback(
    (toggleOpen: () => void): DropdownSection[] => [
      {
        id: "layouts",
        options: [
          {
            id: "layout1",
            text: "Layout 1",
            caption: "6 videos",
            isActive: true,
          },
          {
            id: "layout2",
            text: "Layout 2",
            caption: "4 videos",
          },
        ],
      },
      {
        id: "actions",
        options: [
          {
            id: "rename",
            text: `Rename ${quote("Layout 1")}...`,
            onClick: () => {
              toggleOpen();
              setLayoutDialogState({ type: "rename", initialLayoutName: "Layout 1", onCancel });
            },
          },
          {
            id: "delete",
            text: `Delete ${quote("Layout 1")}`,
            onClick: () => {
              toggleOpen();
              setLayoutDialogState({ type: "delete", layoutName: "Layout 1", onCancel });
            },
          },
        ],
      },
    ],
    [onCancel],
  );

  return (
    <div className={styles.buttonsWrapper}>
      <Dropdown placement="top-end" options={dropdownOptions}>
        {({ setRef, toggleOpen, isOpen }) => {
          return (
            <Button ref={setRef} iconLeft={Squares2X2Icon} isPressed={isOpen} variant="Tertiary" onClick={toggleOpen} />
          );
        }}
      </Dropdown>
      <Button iconLeft={SquaresPlusIcon} variant="Secondary" onClick={onAddClick}>
        Add video
      </Button>
      <LayoutDialogs state={layoutDialogState} />
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
