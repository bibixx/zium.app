import { useCallback, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useStreamPicker } from "../../hooks/useStreamPicker/useStreamPicker";
import { DriverData } from "../../views/Viewer/Viewer.utils";
import { Input } from "../Input/Input";
import { ListItem } from "../ListItem/ListItem";
import { Sheet } from "../Sheet/Sheet";
import { VideoFeedContent } from "../VideoFeedContent/VideoFeedContent";
import { assertNever } from "../../utils/assertNever";
import { StreamInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { isNotNullable } from "../../utils/isNotNullable";
import { useLaggedBehindData } from "../../hooks/useLaggedBehindData/useLaggedBehindData";
import { getIconForStreamInfo } from "../../utils/getIconForStreamInfo";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import styles from "./StreamPicker.module.scss";
import { StreamPickerEntry } from "./StreamPicker.types";

interface StreamPickerProps {
  availableDrivers: DriverData[];
  globalFeeds: Array<StreamInfo | null>;
}
export const StreamPicker = ({ availableDrivers, globalFeeds }: StreamPickerProps) => {
  const { state, onCancel, onChoice } = useStreamPicker();
  const { data: laggedState, reset: resetLaggedState } = useLaggedBehindData(state, state.isOpen);
  const [searchText, setSearchText] = useState("");
  const [fakeSelection, setFakeSelection] = useState<number>(0);
  const listItemsRefs = useRef<(HTMLElement | null)[]>([]);

  const streamPickerEntries: StreamPickerEntry[] = useMemo(() => {
    const globalEntries = globalFeeds
      .filter(isNotNullable)
      .map((streamInfo): StreamPickerEntry | null => {
        if (streamInfo.type === "main") {
          return null;
        }
        return {
          id: streamInfo.type,
          type: "global",
          streamInfo,
        };
      })
      .filter(isNotNullable);

    const driverEntries = availableDrivers.map(
      (driver): StreamPickerEntry => ({
        id: driver.id,
        type: "driver",
        driver,
      }),
    );

    const allEntries = [...globalEntries, ...driverEntries];

    const hiddenEntries = laggedState.isOpen ? laggedState.hiddenEntries : [];
    const pickerType = laggedState.isOpen ? laggedState.pickerType : "all";

    const filteredEntires = allEntries.filter((entry) => {
      if (pickerType === "drivers" && entry.type !== "driver") {
        return false;
      }

      const isHiddenEntry = hiddenEntries.includes(entry.id);

      if (isHiddenEntry) {
        return false;
      }

      if (searchText === "") {
        return true;
      }

      if (entry.type === "driver") {
        const driver = entry.driver;
        return includes(`${driver.lastName} ${driver.firstName}`, searchText);
      }

      if (entry.type === "global") {
        const streamInfo = entry.streamInfo;
        return includes(streamInfo.title, searchText);
      }

      return assertNever(entry);
    });

    return filteredEntires;
  }, [availableDrivers, globalFeeds, searchText, laggedState]);

  const onClosed = () => {
    setSearchText("");
    setFakeSelection(0);
    resetLaggedState();
  };

  const scrollListItemIntoView = useCallback((fs: number) => {
    listItemsRefs.current[fs]?.scrollIntoView({ block: "nearest" });
  }, []);

  const onArrowDown = useCallback(() => {
    const newFakeSelection = loopSelection(fakeSelection + 1, streamPickerEntries.length - 1);
    setFakeSelection(newFakeSelection);
    scrollListItemIntoView(newFakeSelection);
  }, [fakeSelection, scrollListItemIntoView, streamPickerEntries.length]);

  const onArrowUp = useCallback(() => {
    console.log("onArrowUp");

    const newFakeSelection = loopSelection(fakeSelection - 1, streamPickerEntries.length - 1);
    setFakeSelection(newFakeSelection);
    scrollListItemIntoView(newFakeSelection);
  }, [fakeSelection, scrollListItemIntoView, streamPickerEntries.length]);

  const onEnter = useCallback(() => {
    const selectedEntry = streamPickerEntries[fakeSelection];

    if (selectedEntry) {
      onChoice(selectedEntry.id, selectedEntry.type);
    }

    return;
  }, [fakeSelection, streamPickerEntries, onChoice]);

  useHotkeys(
    () => ({
      id: "StreamPicker",
      enabled: state.isOpen,
      allowPropagation: false,
      hotkeys: [
        {
          keys: SHORTCUTS.CLOSE,
          action: onCancel,
          enableOnFormTags: false,
        },
        {
          keys: SHORTCUTS.STREAM_PICKER_NEXT,
          action: onArrowDown,
          enableOnFormTags: false,
        },
        {
          keys: SHORTCUTS.STREAM_PICKER_PREV,
          action: onArrowUp,
          enableOnFormTags: false,
        },
        {
          keys: SHORTCUTS.STREAM_PICKER_SELECT,
          action: onEnter,
          enableOnFormTags: false,
        },
      ],
    }),
    [onCancel, onArrowDown, onArrowUp, onEnter, state.isOpen],
  );

  return (
    <Sheet
      isOpen={state.isOpen}
      onClose={onCancel}
      initialFocus
      onClosed={onClosed}
      wrapperClassName={styles.sheet}
      noPadding
    >
      <div className={styles.wrapper}>
        <div className={styles.inputWrapper}>
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="Search"
            type="text"
            onChange={(value) => {
              setSearchText(value);
              setFakeSelection(0);
              scrollListItemIntoView(0);
            }}
            value={searchText}
          />
        </div>

        <div className={styles.streamsWrapper}>
          {streamPickerEntries.map((entry, i) => {
            if (entry.type === "driver") {
              const driver = entry.driver;

              return (
                <ListItem
                  tabIndex={-1}
                  key={driver.id}
                  onClick={() => onChoice(driver.id, "driver")}
                  isActive={fakeSelection === i}
                  onMouseEnter={() => setFakeSelection(i)}
                  ref={(ref) => {
                    listItemsRefs.current[i] = ref;
                  }}
                >
                  <VideoFeedContent label={driver.lastName} topLabel={driver.firstName} srcList={driver.imageUrls} />
                </ListItem>
              );
            }

            if (entry.type === "global") {
              const stream = entry.streamInfo;

              return (
                <ListItem
                  tabIndex={-1}
                  key={stream.type}
                  onClick={() => onChoice(stream.type, "global")}
                  isActive={fakeSelection === i}
                  onMouseEnter={() => setFakeSelection(i)}
                  ref={(ref) => {
                    listItemsRefs.current[i] = ref;
                  }}
                >
                  <VideoFeedContent label={stream.title} icon={getIconForStreamInfo(stream.type, "outline")} />
                </ListItem>
              );
            }

            return assertNever(entry);
          })}
        </div>
      </div>
    </Sheet>
  );
};

function includes(a: string, b: string) {
  return a.toLocaleLowerCase().includes(b.toLocaleLowerCase());
}

function loopSelection(n: number, max: number) {
  if (n < 0) {
    return max;
  }

  if (n > max) {
    return 0;
  }

  return n;
}
