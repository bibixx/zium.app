export const firstUpper = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
export const toTitleCase = (text: string) => text.split(" ").map(firstUpper).join(" ");
