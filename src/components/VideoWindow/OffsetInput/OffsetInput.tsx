import { CheckIcon, ClockIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "../../Button/Button";
import { Input } from "../../Input/Input";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { isWindows } from "../../../utils/platform";
import { TimeOffsetOffIcon, TimeOffsetOnIcon } from "../../CustomIcons/CustomIcons";
import { useHotkeys } from "../../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../../hooks/useHotkeys/useHotkeys.keys";
import { ZiumOffsetsConfirmOverwriteDialog } from "../../ZiumOffsetsDialogs/ZiumOffsetsConfirmOverwriteDialog";
import { LocalStorageClient } from "../../../utils/localStorageClient";
import styles from "./OffsetInput.module.scss";

export const dontAskForOverrideLocalStorageClient = new LocalStorageClient(
  "dontAskForOffsetOverride",
  z.boolean(),
  false,
);

interface OffsetInputProps {
  onChange: (value: number) => void;
  initialValue: number;
  usesZiumOffsets: boolean;
}
export const OffsetInput = ({ onChange: onExternalChange, initialValue, usesZiumOffsets }: OffsetInputProps) => {
  const [isContracted, setIsContracted] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [numberValue, setNumberValue] = useState(initialValue);
  const [value, setValue] = useState(formatValue(numberValue));
  const { preventHiding } = useViewerUIVisibility();

  const { setState: setDialogState, state: dialogState } = useOffsetInputDialogState();
  const withConfirmation = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any[]) => void>(fn: T) =>
      (...args: Parameters<T>) => {
        if (usesZiumOffsets && !dontAskForOverrideLocalStorageClient.get()) {
          const onClose = () => {
            setDialogState({ isOpen: false });
          };

          const onApply = (dontAskForOverride: boolean) => {
            fn(...args);
            onClose();

            if (dontAskForOverride) {
              dontAskForOverrideLocalStorageClient.set(true);
            }
          };

          setDialogState({ isOpen: true, onApply, onClose });
          return;
        }

        fn(...args);
      },
    [setDialogState, usesZiumOffsets],
  );

  useEffect(() => {
    preventHiding(isFocused);
  }, [isFocused, preventHiding]);

  useEffect(() => {
    if (!isFocused) {
      setNumberValue(initialValue);
      setValue(formatValue(initialValue));
    }
  }, [isFocused, initialValue]);

  const onChange = withConfirmation((value: string, e?: React.ChangeEvent) => {
    if (!NUMBER_REGEX.test(value)) {
      e?.preventDefault();
      return;
    }

    setValue(value);
    const numberValue = Number.parseFloat(value.replace(/^(\+|_)/, "").trim());
    const nonNanNumberValue = Number.isNaN(numberValue) ? 0 : numberValue;
    setNumberValue(roundNumberValue(nonNanNumberValue));
    onExternalChange(nonNanNumberValue);
  });

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setValue(formatValue(numberValue));
    setIsFocused(false);
  };

  const onDecrease = useMemo(
    () =>
      withConfirmation((e: React.MouseEvent | KeyboardEvent) => {
        const newValue = numberValue - getValueDelta(e);
        setNumberValue(roundNumberValue(newValue));
        setValue(formatValue(newValue));
        onExternalChange(newValue);
      }),
    [numberValue, onExternalChange, withConfirmation],
  );

  const onIncrease = useMemo(
    () =>
      withConfirmation((e: React.MouseEvent | KeyboardEvent) => {
        const newValue = numberValue + getValueDelta(e);
        setNumberValue(roundNumberValue(newValue));
        setValue(formatValue(newValue));
        onExternalChange(newValue);
      }),
    [numberValue, onExternalChange, withConfirmation],
  );

  useHotkeys(
    () => ({
      allowPropagation: false,
      enabled: isFocused,
      hotkeys: [
        {
          keys: SHORTCUTS.OFFSET_INPUT_INCREASE_SMALL,
          enableOnFormTags: true,
          preventDefault: true,
          action: onIncrease,
        },
        {
          keys: SHORTCUTS.OFFSET_INPUT_INCREASE_MEDIUM,
          enableOnFormTags: true,
          preventDefault: true,
          action: onIncrease,
        },
        {
          keys: SHORTCUTS.OFFSET_INPUT_INCREASE_BIG,
          enableOnFormTags: true,
          preventDefault: true,
          action: onIncrease,
        },

        {
          keys: SHORTCUTS.OFFSET_INPUT_DECREASE_SMALL,
          enableOnFormTags: true,
          preventDefault: true,
          action: onDecrease,
        },
        {
          keys: SHORTCUTS.OFFSET_INPUT_DECREASE_MEDIUM,
          enableOnFormTags: true,
          preventDefault: true,
          action: onDecrease,
        },
        {
          keys: SHORTCUTS.OFFSET_INPUT_DECREASE_BIG,
          enableOnFormTags: true,
          preventDefault: true,
          action: onDecrease,
        },
      ],
    }),
    [isFocused, onDecrease, onIncrease],
  );

  if (isContracted) {
    return (
      <div onMouseEnter={() => preventHiding(true)} onMouseLeave={() => preventHiding(isFocused)}>
        <Button
          variant="SecondaryInverted"
          iconLeft={numberValue !== 0 ? TimeOffsetOnIcon : TimeOffsetOffIcon}
          onClick={() => setIsContracted(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={styles.wrapper}
        onMouseEnter={() => preventHiding(true)}
        onMouseLeave={() => preventHiding(isFocused)}
      >
        <Button
          className={styles.button}
          variant="Tertiary"
          iconLeft={CheckIcon}
          onClick={() => setIsContracted(true)}
        />
        <div className={styles.divider}></div>
        <Button className={styles.button} variant="Tertiary" iconLeft={MinusIcon} onClick={onDecrease} />
        <Input
          isRounded
          onChange={onChange}
          value={value}
          onBlur={onBlur}
          onFocus={onFocus}
          className={styles.input}
          labelClassName={styles.inputLabel}
          icon={ClockIcon}
        />
        <Button className={styles.button} variant="Tertiary" iconLeft={PlusIcon} onClick={onIncrease} />
      </div>
      <ZiumOffsetsConfirmOverwriteDialog
        isOpen={dialogState.isOpen}
        onClose={dialogState.onClose}
        onApply={dialogState.onApply}
      />
    </>
  );
};

const getSign = (n: number): string => {
  switch (Math.sign(n)) {
    case -1: {
      return "-";
    }
    case 1: {
      return "+";
    }
    case 0:
    default: {
      return "";
    }
  }
};

const MIN_DECIMAL_ACCURACY = 1;
const MAX_DECIMAL_ACCURACY = 5;
const formatValue = (n: number) => {
  const [integer, decimal] = Math.abs(n)
    .toFixed(findAccuracy(Math.abs(n)))
    .split(".");

  return `${getSign(n)}${integer.padStart(1, "0")}.${decimal}`;
};

const NUMBER_REGEX = /^(\+|-)?\d*(\.\d*)?$/;

const getValueDelta = (e: React.MouseEvent | KeyboardEvent) => {
  const isMetaPressed = isWindows ? e.ctrlKey : e.metaKey;

  if (isMetaPressed) {
    return 0.1;
  }

  if (e.shiftKey) {
    return 1;
  }

  return 0.5;
};

const roundNumberValue = (n: number) => Math.round(n * 10 ** MAX_DECIMAL_ACCURACY) / 10 ** MAX_DECIMAL_ACCURACY;

const findAccuracy = (n: number) => {
  let currentAccuracy = MAX_DECIMAL_ACCURACY;
  while (currentAccuracy > MIN_DECIMAL_ACCURACY) {
    if (!n.toFixed(currentAccuracy).endsWith("0")) {
      break;
    }

    currentAccuracy--;
  }

  return currentAccuracy;
};

type UseOffsetInputDialogState =
  | {
      isOpen: true;
      onApply: (dontAskForOverride: boolean) => void;
      onClose: () => void;
    }
  | {
      isOpen: false;
      onApply?: undefined;
      onClose?: undefined;
    };
const useOffsetInputDialogState = () => {
  const [state, setState] = useState<UseOffsetInputDialogState>({ isOpen: false });

  return { state, setState };
};
