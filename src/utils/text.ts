const nonUpperableWords = [
  "e",
  "de",
  "AWS",
  "dell'Emilia-Romagna",
  "dell'Emilia Romagna",
  "del",
  "in",
  "STC",
  "d’Italia",
  "MSC",
  "von",
  "du",
];
const lowerCaseNonUpperableWordsSet = Object.fromEntries(nonUpperableWords.map((w, i) => [w.toLowerCase(), i]));

const applyToTextParts = (text: string, separator: string, mapper: (text: string) => string) =>
  text.split(separator).map(mapper).join(separator);

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

export const NBSP = "\xa0";
export const MDASH = "\u2014";
export const OPEN_QUOTE = "\u201c";
export const CLOSE_QUOTE = "\u201d";
export const NON_BREAKING_HYPHEN = "\u2011";

export const quote = (text: string) => `${OPEN_QUOTE}${text}${CLOSE_QUOTE}`;
