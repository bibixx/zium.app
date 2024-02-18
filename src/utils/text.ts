import { pipe } from "ts-functional-pipe";

export const NBSP = "\xa0";
export const MDASH = "\u2014";
export const OPEN_QUOTE = "\u201c";
export const CLOSE_QUOTE = "\u201d";
export const APOSTROPHE = "\u2019";
export const NON_BREAKING_HYPHEN = "\u2011";
export const TM_SIGN = "\u2122";
export const MIDDLE_DOT = "\u30fb";

export const quote = (text: string) => `${OPEN_QUOTE}${text}${CLOSE_QUOTE}`;

const nonUpperableWords = [
  "e",
  "de",
  "AWS",
  "dell'Emilia-Romagna",
  "dell'Emilia",
  "del",
  "in",
  "STC",
  "d’Italia",
  "MSC",
  "von",
  "du",
  "VTB",
  "BWT",
  "DHL",
  "der",
  "della",
];
const lowerCaseNonUpperableWordsSet = Object.fromEntries(nonUpperableWords.map((w, i) => [w.toLowerCase(), i]));

const applyToTextParts = (text: string, separator: string, mapper: (text: string) => string) =>
  text.split(separator).map(mapper).join(separator);

export const fixEmDashes = (text: string) => text.replace(" - ", `${NBSP}${MDASH}${NBSP}`);

const toFirstUpper = (text: string) => {
  const nonUpperableWordIndex = lowerCaseNonUpperableWordsSet[text.toLowerCase()] ?? -1;
  const nonUpperableWord = nonUpperableWords[nonUpperableWordIndex];

  if (nonUpperableWord != null) {
    return nonUpperableWord;
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
};

const applyTitleCaseToWord = (text: string): string => {
  if (text.includes("-")) {
    return applyToTextParts(text, "-", applyTitleCaseToWord);
  }

  return toFirstUpper(text);
};

export const toTitleCase = (text: string) => applyToTextParts(text, " ", applyTitleCaseToWord);

const removeDateFromStart = (text: string) => text.replace(/^[\d ]+/, "");

const raceApostrophesSet: Record<string, string | undefined> = {
  "dell'Emilia-Romagna": `dell${APOSTROPHE}Emilia-Romagna`,
  "dell'Emilia": `dell${APOSTROPHE}Emilia`,
};
export const formatRaceName = (text: string, addTm: boolean) => {
  return pipe(
    toTitleCase,
    fixEmDashes,
    removeDateFromStart,
    (text) => applyToTextParts(text, " ", (w) => raceApostrophesSet[w] ?? w),
    (text) => text.replace(/Prix /, `Prix${NBSP}`),
    addTm ? (text) => text + TM_SIGN : (text) => text,
  )(text);
};

export const includesCaseInsensitive = (text: string, searchString: string) =>
  text.toLocaleLowerCase().includes(searchString.toLocaleLowerCase());
