import { DropdownSection } from "../../Dropdown/Dropdown";

export const getTrackPrettyName = (lang: string, fallback: string) => {
  if (lang === "eng") {
    return "English";
  }

  if (lang === "fra") {
    return "Français";
  }

  if (lang === "deu") {
    return "Deutsch";
  }

  if (lang === "spa") {
    return "Español";
  }

  if (lang === "por") {
    return "Português";
  }

  if (lang === "nld") {
    return "Nederlands";
  }

  if (lang === "fx" || lang === "cfx") {
    return "FX";
  }

  return fallback;
};

export const countTotalNumberOfOptions = (section: DropdownSection[]) => {
  return section.reduce((count, o) => count + o.options.length, 0);
};
