const nonUpperableWords = ["e", "de", "AWS", "dell'Emilia-Romagna", "dell'Emilia Romagna" "del", "in", "STC", "d’Italia", "MSC", "von", "du"];
const lowerCaseNonUpperableWordsSet = Object.fromEntries(nonUpperableWords.map((w, i) => [w.toLowerCase(), i]));

export const firstUpper = (text: string) => {
  const nonUpperableWordIndex = lowerCaseNonUpperableWordsSet[text.toLowerCase()] ?? -1;
  const nonUpperableWord = nonUpperableWords[nonUpperableWordIndex];

  if (nonUpperableWord != null) {
    return nonUpperableWord;
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
};

export const toTitleCase = (text: string) => text.split(" ").map(firstUpper).join(" ");

export const NBSP = "\xa0";
export const MDASH = "\u2014";
export const OPEN_QUOTE = "\u201c";
export const CLOSE_QUOTE = "\u201d";

export const quote = (text: string) => `${OPEN_QUOTE}${text}${CLOSE_QUOTE}`;
