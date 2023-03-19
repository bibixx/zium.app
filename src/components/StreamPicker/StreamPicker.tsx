import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useStreamPicker } from "../../hooks/useStreamPicker/useStreamPicker";
import { DriverData } from "../../views/Viewer/Viewer.utils";
import { Input } from "../Input/Input";
import { ListItem } from "../ListItem/ListItem";
import { Sheet } from "../Sheet/Sheet";
import { VideoFeedContent } from "../VideoFeedContent/VideoFeedContent";
import styles from "./StreamPicker.module.scss";

interface StreamPickerProps {
  availableDrivers: DriverData[];
}
export const StreamPicker = ({ availableDrivers }: StreamPickerProps) => {
  const { state, onCancel, onChoice } = useStreamPicker();
  const [searchText, setSearchText] = useState("");
  const [fakeSelection, setFakeSelection] = useState<number>(0);
  const listItemsRefs = useRef<(HTMLElement | null)[]>([]);

  const filteredDrivers = availableDrivers.filter((driver) => {
    if (state.isOpen) {
      const isHiddenEntry = state.hiddenEntries.includes(driver.id);

      if (isHiddenEntry) {
        return false;
      }
    }

    if (searchText === "") {
      return true;
    }

    return includes(`${driver.lastName} ${driver.firstName}`, searchText);
  });

  const onClosed = () => {
    setSearchText("");
    setFakeSelection(0);
  };

  useEffect(() => {
    if (!state.isOpen) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const isArrowUp = e.key === "ArrowUp";
      const isArrowDown = e.key === "ArrowDown";
      const isEscape = e.key === "Escape";
      const isEnter = e.key === "Enter";

      if (!isArrowDown && !isArrowUp && !isEscape && !isEnter) {
        return;
      }

      e.preventDefault();

      if (isEscape) {
        onCancel();
        return;
      }

      if (isArrowDown) {
        setFakeSelection((fs) => loopSelection(fs + 1, filteredDrivers.length - 1));
        return;
      }

      if (isArrowUp) {
        setFakeSelection((fs) => loopSelection(fs - 1, filteredDrivers.length - 1));
        return;
      }

      if (isEnter) {
        const selectedDriver = filteredDrivers[fakeSelection];
        console.log(fakeSelection, filteredDrivers);

        if (selectedDriver) {
          onChoice(selectedDriver.id);
        }

        return;
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      return document.removeEventListener("keydown", onKeyDown);
    };
  }, [fakeSelection, filteredDrivers, onCancel, onChoice, state.isOpen]);

  useEffect(() => {
    listItemsRefs.current[fakeSelection]?.scrollIntoView({ block: "nearest" });
  }, [fakeSelection]);

  return (
    <Sheet isOpen={state.isOpen} onClose={onCancel} initialFocus onClosed={onClosed} wrapperClassName={styles.sheet}>
      <div className={styles.wrapper}>
        <div className={styles.inputWrapper}>
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="Search"
            type="text"
            onChange={(e) => {
              setSearchText(e.target.value);
              setFakeSelection(0);
            }}
            value={searchText}
          />
        </div>

        <div className={styles.streamsWrapper}>
          {filteredDrivers.map((driver, i) => (
            <ListItem
              tabIndex={-1}
              key={driver.id}
              onClick={() => onChoice(driver.id)}
              isActive={fakeSelection === i}
              onMouseEnter={() => setFakeSelection(i)}
              innerRef={(ref) => {
                listItemsRefs.current[i] = ref;
              }}
            >
              <VideoFeedContent label={driver.lastName} topLabel={driver.firstName} imageSrc={driver.imageUrl} />
            </ListItem>
          ))}
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
