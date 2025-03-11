import { useCallback, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { PickerType, useStreamPicker } from "../../hooks/useStreamPicker/useStreamPicker";
import { DriverData } from "../../views/Viewer/Viewer.utils";
import { Input } from "../Input/Input";
import { ListItem } from "../ListItem/ListItem";
import { Sheet } from "../Sheet/Sheet";
import { VideoFeedContent } from "../VideoFeedContent/VideoFeedContent";
import { assertNever } from "../../utils/assertNever";
import { DataStreamInfo, MainStreamInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { isNotNullable } from "../../utils/isNotNullable";
import { useLaggedBehindData } from "../../hooks/useLaggedBehindData/useLaggedBehindData";
import { getIconForStreamInfo } from "../../utils/getIconForStreamInfo";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import styles from "./StreamPicker.module.scss";
import { StreamPickerEntry } from "./StreamPicker.types";

interface StreamPickerProps {
  availableDrivers: DriverData[];
  globalFeeds: Array<DataStreamInfo | null>;
  mainFeeds: Array<MainStreamInfo>;
}
export const StreamPicker = ({ availableDrivers, globalFeeds, mainFeeds }: StreamPickerProps) => {
  const { state, onCancel, onChoice } = useStreamPicker();
  const { data: laggedState, reset: resetLaggedState } = useLaggedBehindData(state, state.isOpen);
  const [searchText, setSearchText] = useState("");
  const [fakeSelection, setFakeSelection] = useState<number>(0);
  const listItemsRefs = useRef<(HTMLElement | null)[]>([]);

  const onEntryChosen = useCallback(
    (selectedEntry: StreamPickerEntry) => {
      if (selectedEntry.type === "main") {
        onChoice({
          type: "main",
          streamId: selectedEntry.streamInfo.type,
        });
        return;
      }

      if (selectedEntry.type === "driver") {
        onChoice({
          type: "driver",
          driverId: selectedEntry.driver.id,
        });
        return;
      }

      if (selectedEntry.type === "data") {
        onChoice({
          type: "data",
          streamId: selectedEntry.streamInfo.type,
        });
        return;
      }

      if (selectedEntry.type === "live-timing") {
        onChoice({
          type: "live-timing",
          dataType: selectedEntry.dataType,
        });
        return;
      }

      return assertNever(selectedEntry);
    },
    [onChoice],
  );

  const streamPickerEntries: StreamPickerEntry[] = useMemo(() => {
    const leaderboardEntry: StreamPickerEntry = {
      id: "leaderboard",
      type: "live-timing",
      dataType: "leaderboard",
    };
    const mapEntry: StreamPickerEntry = {
      id: "map",
      type: "live-timing",
      dataType: "map",
    };

    const globalEntries = globalFeeds.filter(isNotNullable).map((streamInfo): StreamPickerEntry => {
      return {
        id: streamInfo.type,
        type: "data",
        streamInfo,
      };
    });

    const mainEntries = mainFeeds.map((streamInfo): StreamPickerEntry => {
      return {
        id: streamInfo.type,
        type: "main",
        streamInfo,
      };
    });

    const driverEntries = availableDrivers.map(
      (driver): StreamPickerEntry => ({
        id: driver.id,
        type: "driver",
        driver,
      }),
    );

    const allEntries = [...mainEntries, ...globalEntries, leaderboardEntry, mapEntry, ...driverEntries];

    const hiddenEntries = laggedState.isOpen ? laggedState.hiddenEntries : [];
    const pickerType: PickerType[] = laggedState.isOpen ? laggedState.pickerTypes : [];

    const filteredEntires = allEntries.filter((entry) => {
      if (entry.type === "driver" && !pickerType.includes("drivers")) {
        return false;
      }

      if (entry.type === "data" && !pickerType.includes("data")) {
        return false;
      }

      if (entry.type === "main" && !pickerType.includes("main")) {
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

      if (entry.type === "data") {
        const streamInfo = entry.streamInfo;
        return includes(streamInfo.title, searchText);
      }

      if (entry.type === "main") {
        const streamInfo = entry.streamInfo;
        return includes(streamInfo.title, searchText);
      }

      if (entry.type === "live-timing") {
        return includes("Live Timing", searchText);
      }

      return assertNever(entry);
    });

    return filteredEntires;
  }, [availableDrivers, globalFeeds, mainFeeds, searchText, laggedState]);

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
    const newFakeSelection = loopSelection(fakeSelection - 1, streamPickerEntries.length - 1);
    setFakeSelection(newFakeSelection);
    scrollListItemIntoView(newFakeSelection);
  }, [fakeSelection, scrollListItemIntoView, streamPickerEntries.length]);

  const onEnter = useCallback(() => {
    const selectedEntry = streamPickerEntries[fakeSelection];

    if (selectedEntry) {
      onEntryChosen(selectedEntry);
    }

    return;
  }, [fakeSelection, streamPickerEntries, onEntryChosen]);

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
                  onClick={() => onEntryChosen(entry)}
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

            if (entry.type === "data") {
              const stream = entry.streamInfo;

              return (
                <ListItem
                  tabIndex={-1}
                  key={stream.type}
                  onClick={() => onEntryChosen(entry)}
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

            if (entry.type === "main") {
              const stream = entry.streamInfo;

              return (
                <ListItem
                  tabIndex={-1}
                  key={stream.type}
                  onClick={() => onEntryChosen(entry)}
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

            if (entry.type === "live-timing") {
              return (
                <ListItem
                  tabIndex={-1}
                  key={entry.id}
                  onClick={() => onEntryChosen(entry)}
                  isActive={fakeSelection === i}
                >
                  {entry.dataType === "leaderboard" ? "Leaderboard" : "Map"}
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
