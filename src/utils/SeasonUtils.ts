import { COMING_SOON_SEASONS_DATA, SupportedSeasons, SUPPORTED_SEASONS } from "../constants/seasons";

const getIsSupportedSeason = function <T extends SupportedSeasons>(seasonId: T | string): seasonId is SupportedSeasons {
  return (SUPPORTED_SEASONS as readonly string[]).includes(seasonId);
};

export const isSeasonComingSoon = (season: string) => {
  if (!getIsSupportedSeason(season)) {
    return false;
  }

  const comingSoonData = COMING_SOON_SEASONS_DATA[season];
  return comingSoonData == null ? false : comingSoonData.getTime() > Date.now();
};
