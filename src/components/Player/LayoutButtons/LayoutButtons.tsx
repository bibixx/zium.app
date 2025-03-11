import { PlusCircleIcon, RectangleGroupIcon } from "@heroicons/react/20/solid";
import { useCallback, useMemo, useState } from "react";
import { ChosenValueType, useStreamPicker } from "../../../hooks/useStreamPicker/useStreamPicker";
import { Dimensions } from "../../../types/Dimensions";
import { GridWindow } from "../../../types/GridWindow";
import { ELLIPSIS, quote } from "../../../utils/text";
import {
  WindowGridSavedLayout,
  WindowGridState,
} from "../../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { Button } from "../../Button/Button";
import { DropdownSection, DropdownSectionElement, StatelessDropdown } from "../../Dropdown/Dropdown";
import { sizePxToPercent } from "../../RnDWindow/RnDWindow.utils";
import { LayoutDialogs } from "../LayoutDialogs/LayoutDialogs";
import { LayoutDialogState } from "../LayoutDialogs/LayoutDialogs.types";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { assertNever } from "../../../utils/assertNever";
import { Tooltip } from "../../Tooltip/Tooltip";
import styles from "./LayoutButtons.module.scss";
import { useLayoutsDropdownHotkeys, useLayoutsDropdownState } from "./LayoutButtons.hooks";
import { LayoutCaption } from "./LayoutCaption/LayoutCaption";

interface LayoutButtonsProps {
  usedWindows: string[];
  createWindow: (newWindow: GridWindow, dimensions: Dimensions) => void;
  loadLayout: (selectedLayoutIndex: number) => void;
  duplicateLayout: (layoutIndex: number, name: string) => void;
  renameLayout: (layoutIndex: number, name: string) => void;
  deleteLayout: (layoutIndex: number) => void;
  viewerState: WindowGridState;
  hasUsedAllStreams: boolean;
}
export const LayoutButtons = ({
  usedWindows,
  createWindow,
  loadLayout,
  duplicateLayout,
  renameLayout,
  deleteLayout,
  viewerState,
  hasUsedAllStreams,
}: LayoutButtonsProps) => {
  const { requestStream } = useStreamPicker();
  const [layoutDialogState, setLayoutDialogState] = useState<LayoutDialogState>({ type: "closed" });
  const onCancel = useCallback(() => setLayoutDialogState({ type: "closed" }), []);
  const selectedLayoutIndex = useMemo(() => viewerState.currentLayoutIndex, [viewerState.currentLayoutIndex]);
  const { dropdownState, withShortcutVisible } = useLayoutsDropdownState({ loadLayout });

  const onAddClick = useCallback(async () => {
    const chosenData = await requestStream(["drivers", "data"], usedWindows);
    if (chosenData == null) {
      return;
    }

    const newWindow = getNewWindow(chosenData);

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
  }, [createWindow, requestStream, usedWindows]);

  useHotkeys(() => {
    return {
      id: "LayoutButtons",
      allowPropagation: true,
      hotkeys: [
        {
          keys: SHORTCUTS.OPEN_LAYOUTS,
          action: onAddClick,
          enabled: !hasUsedAllStreams,
        },
      ],
    };
  }, [hasUsedAllStreams, onAddClick]);

  useLayoutsDropdownHotkeys({
    isOpen: dropdownState.isOpen,
    toggleOpen: dropdownState.toggleOpen,
    withShortcutVisible,
  });

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
              caption: (
                <LayoutCaption videosCount={layout.windows.length} i={i} withShortcutVisible={withShortcutVisible} />
              ),
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
              text: `Duplicate layout${ELLIPSIS}`,
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
              text: `Rename ${quote(selectedLayout.name)}${ELLIPSIS}`,
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
    [
      viewerState.savedLayouts,
      selectedLayoutIndex,
      withShortcutVisible,
      loadLayout,
      onCancel,
      duplicateLayout,
      renameLayout,
      deleteLayout,
    ],
  );

  return (
    <div className={styles.buttonsWrapper}>
      <StatelessDropdown placement="top-end" width={248} options={dropdownOptions} {...dropdownState}>
        {({ setRef, toggleOpen, isOpen }) => {
          return (
            <Button
              ref={setRef}
              iconLeft={RectangleGroupIcon}
              isPressed={isOpen}
              variant="Tertiary"
              onClick={toggleOpen}
            />
          );
        }}
      </StatelessDropdown>
      <Tooltip content={hasUsedAllStreams && "There are no more streams available"} delayDuration={300}>
        <Button
          iconLeft={PlusCircleIcon}
          variant="Secondary"
          onClick={hasUsedAllStreams ? undefined : onAddClick}
          disabledState={hasUsedAllStreams}
        >
          Add video
        </Button>
      </Tooltip>
      <LayoutDialogs state={layoutDialogState} />
    </div>
  );
};

const getNewWindow = (chosenValue: ChosenValueType): GridWindow | null => {
  if (chosenValue.type === "driver") {
    return {
      driverId: chosenValue.driverId,
      id: "",
      type: "driver",
    };
  }

  if (chosenValue.type === "main") {
    return {
      id: "",
      type: "main",
      streamId: chosenValue.streamId,
    };
  }

  if (chosenValue.type === "data") {
    return {
      id: "",
      type: chosenValue.streamId,
    };
  }

  if (chosenValue.type === "live-timing") {
    return {
      id: "",
      type: "live-timing",
      dataType: chosenValue.dataType,
    };
  }

  return assertNever(chosenValue);
};

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
