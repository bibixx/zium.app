export const padStart = (value: string | number, maxLength: number, fillString: string = "0") => {
  return String(value).padStart(maxLength, fillString);
};
