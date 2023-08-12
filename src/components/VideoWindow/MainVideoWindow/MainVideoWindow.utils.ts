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

  if (lang === "fx") {
    return "FX";
  }

  return fallback;
};
