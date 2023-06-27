import { CheckIcon, ClockIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import { Key } from "ts-key-enum";
import { Button } from "../../Button/Button";
import { Input } from "../../Input/Input";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { useViewerUIVisibility } from "../../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { isWindows } from "../../../utils/platform";
import { TimeOffsetOffIcon, TimeOffsetOnIcon } from "../../CustomIcons/CustomIcons";
import styles from "./OffsetInput.module.scss";

interface OffsetInputProps {
  onChange: (value: number) => void;
  initialValue: number;
}
export const OffsetInput = ({ onChange: onExternalChange, initialValue }: OffsetInputProps) => {
  const [isContracted, setIsContracted] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [numberValue, setNumberValue] = useState(initialValue);
  const [value, setValue] = useState(formatValue(numberValue));
  const { preventHiding } = useViewerUIVisibility();

  useEffect(() => {
    preventHiding(isFocused);
  }, [isFocused, preventHiding]);

  useEffect(() => {
    if (!isFocused) {
      setNumberValue(initialValue);
      setValue(formatValue(initialValue));
    }
  }, [isFocused, initialValue]);

  const onChange = (value: string, e?: React.ChangeEvent) => {
    if (!NUMBER_REGEX.test(value)) {
      e?.preventDefault();
      return;
    }

    setValue(value);
    const numberValue = Number.parseFloat(value.replace(/^(\+|_)/, "").trim());
    const nonNanNumberValue = Number.isNaN(numberValue) ? 0 : numberValue;
    setNumberValue(roundNumberValue(nonNanNumberValue));
    onExternalChange(nonNanNumberValue);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setValue(formatValue(numberValue));
    setIsFocused(false);
  };

  const onDecrease = (e: React.MouseEvent | KeyboardEvent) => {
    const newValue = numberValue - getValueDelta(e);
    setNumberValue(roundNumberValue(newValue));
    setValue(formatValue(newValue));
    onExternalChange(newValue);
  };

  const onIncrease = (e: React.MouseEvent | KeyboardEvent) => {
    const newValue = numberValue + getValueDelta(e);
    setNumberValue(roundNumberValue(newValue));
    setValue(formatValue(newValue));
    onExternalChange(newValue);
  };

  const scope = useHotkeysStack(isFocused, false);
  useScopedHotkeys(Key.ArrowUp, scope, onIncrease, {
    ignoreModifiers: true,
    enableOnFormTags: true,
    preventDefault: true,
  });
  useScopedHotkeys(Key.ArrowDown, scope, onDecrease, {
    ignoreModifiers: true,
    enableOnFormTags: true,
    preventDefault: true,
  });

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
    <div
      className={styles.wrapper}
      onMouseEnter={() => preventHiding(true)}
      onMouseLeave={() => preventHiding(isFocused)}
    >
      <Button className={styles.button} variant="Tertiary" iconLeft={CheckIcon} onClick={() => setIsContracted(true)} />
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
