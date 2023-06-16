import { Squares2X2Icon, SquaresPlusIcon } from "@heroicons/react/20/solid";
import { useCallback, useMemo, useState } from "react";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { Dimensions } from "../../../types/Dimensions";
import { GridWindow } from "../../../types/GridWindow";
import { quote } from "../../../utils/text";
import {
  WindowGridSavedLayout,
  WindowGridState,
} from "../../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { Button } from "../../Button/Button";
import { Dropdown, DropdownSection, DropdownSectionElement } from "../../Dropdown/Dropdown";
import { sizePxToPercent } from "../../RnDWindow/RnDWindow.utils";
import { LayoutDialogs } from "../LayoutDialogs/LayoutDialogs";
import { LayoutDialogState } from "../LayoutDialogs/LayoutDialogs.types";
import styles from "./LayoutButtons.module.scss";

interface LayoutButtonsProps {
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
  loadLayout: (selectedLayoutIndex: number) => void;
  duplicateLayout: (layoutIndex: number, name: string) => void;
  renameLayout: (layoutIndex: number, name: string) => void;
  deleteLayout: (layoutIndex: number) => void;
  viewerState: WindowGridState;
  hasOnlyOneStream: boolean;
}
export const LayoutButtons = ({
  usedWindows,
  createWindow,
  loadLayout,
  duplicateLayout,
  renameLayout,
  deleteLayout,
  viewerState,
  hasOnlyOneStream,
}: LayoutButtonsProps) => {
  const { requestStream } = useStreamPicker();
  const { preventHiding } = useViewerUIVisibility();
  const [layoutDialogState, setLayoutDialogState] = useState<LayoutDialogState>({ type: "closed" });
  const onCancel = useCallback(() => setLayoutDialogState({ type: "closed" }), []);

  const selectedLayoutIndex = useMemo(() => viewerState.currentLayoutIndex, [viewerState.currentLayoutIndex]);

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
    (toggleOpen: () => void): (DropdownSection | false)[] => {
      const layouts = viewerState.savedLayouts;
      const selectedLayout = layouts[selectedLayoutIndex];

      return [
        {
          id: "layouts",
          options: layouts.map(
            (layout, i): DropdownSectionElement => ({
              id: String(i),
              text: layout.name,
              caption: getVideosText(layout.windows.length),
              isActive: i === selectedLayoutIndex,
              onClick: () => {
                toggleOpen();
                loadLayout(i);
              },
            }),
          ),
        },
        {
          id: "actions",
          options: [
            {
              id: "duplicate",
              text: `Duplicate layout...`,
              onClick: () => {
                toggleOpen();
                setLayoutDialogState({
                  type: "duplicate",
                  initialLayoutName: getNewLayoutName(layouts),
                  onCancel,
                  bannedNames: layouts.map((l) => l.name),
                  onDuplicate: (name: string) => {
                    duplicateLayout(selectedLayoutIndex, name);
                    onCancel();
                  },
                });
              },
            },
            {
              id: "rename",
              text: `Rename ${quote(selectedLayout.name)}...`,
              onClick: () => {
                toggleOpen();
                setLayoutDialogState({
                  type: "rename",
                  initialLayoutName: selectedLayout.name,
                  onCancel,
                  bannedNames: layouts.map((l) => l.name),
                  onRename: (name: string) => {
                    renameLayout(selectedLayoutIndex, name);
                    onCancel();
                  },
                });
              },
            },
            layouts.length > 1 && {
              id: "delete",
              text: `Delete ${quote(selectedLayout.name)}`,
              onClick: () => {
                toggleOpen();
                setLayoutDialogState({
                  type: "delete",
                  layoutName: selectedLayout.name,
                  onCancel,
                  onDelete: () => {
                    deleteLayout(selectedLayoutIndex);
                    onCancel();
                  },
                });
              },
            },
          ],
        },
      ];
    },
    [viewerState.savedLayouts, selectedLayoutIndex, loadLayout, onCancel, duplicateLayout, renameLayout, deleteLayout],
  );

  return (
    <div className={styles.buttonsWrapper}>
      <Dropdown
        placement="top-end"
        options={dropdownOptions}
        onOpened={() => preventHiding(true)}
        onClosed={() => preventHiding(false)}
      >
        {({ setRef, toggleOpen, isOpen }) => {
          return (
            <Button ref={setRef} iconLeft={Squares2X2Icon} isPressed={isOpen} variant="Tertiary" onClick={toggleOpen} />
          );
        }}
      </Dropdown>
      <Button iconLeft={SquaresPlusIcon} variant="Secondary" onClick={onAddClick} disabled={hasOnlyOneStream}>
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

function getVideosText(videosCount: number) {
  if (videosCount === 1) {
    return `${videosCount} video`;
  }

  return `${videosCount} videos`;
}

function getNewLayoutName(layouts: WindowGridSavedLayout[]) {
  const baseLayoutName = `Layout ${layouts.length + 1}`;
  const layoutNames = layouts.map((l) => l.name);

  if (!layoutNames.includes(baseLayoutName)) {
    return baseLayoutName;
  }

  let layoutIndex = layouts.length + 2;
  let infiniteLoopGuard = 0;

  while (layoutNames.includes(`Layout ${layoutIndex}`)) {
    if (++infiniteLoopGuard > 1000) {
      return "Layout";
    }

    layoutIndex++;
  }

  return `Layout ${layoutIndex}`;
}
