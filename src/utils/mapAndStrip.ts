import { isNotNullable } from "./isNotNullable";

export const mapAndStrip = <InputType, OutputType, InvalidType>(
  array: InputType[],
  predicate: (value: InputType) => OutputType | InvalidType,
  shouldBeKept: (value: OutputType | InvalidType) => value is OutputType,
) => {
  return array.reduce((acc, el) => {
    const value = predicate(el);

    if (shouldBeKept(value)) {
      acc.push(value);
    }

    return acc;
  }, [] as OutputType[]);
};

export const mapAndStripNullable = <InputType, OutputType>(
  array: InputType[],
  predicate: (value: InputType) => OutputType | null | undefined,
): OutputType[] => mapAndStrip(array, predicate, isNotNullable<OutputType>);

export const stripNullables = <T>(array: (T | null | undefined)[]): T[] => array.filter(isNotNullable);
