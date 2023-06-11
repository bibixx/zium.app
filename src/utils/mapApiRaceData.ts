import { RaceData } from "../hooks/useRacesList/useRacesList.types";

export const mapApiRaceData = (race: any): RaceData | null => {
  const racePageId = String(race.metadata.emfAttributes.PageID);
  const title = race.metadata.shortDescription;
  const pictureUrl = race.metadata.pictureUrl;
  const countryName = race.metadata.emfAttributes.Meeting_Country_Name;
  const startDate = new Date(race.metadata.emfAttributes.Meeting_Start_Date);
  const endDate = new Date(race.metadata.emfAttributes.Meeting_End_Date);
  const roundNumber = +race.metadata.emfAttributes.Championship_Meeting_Ordinal;
  const description = race.metadata.emfAttributes.Meeting_Official_Name;
  const countryId = race.metadata.emfAttributes.MeetingCountryKey;
  const contentId = race.metadata.contentId;

  // if (!title.toLowerCase().includes("grand prix")) {
  //   return null;
  // }

  return {
    contentId,
    id: racePageId,
    title,
    pictureUrl,
    countryName,
    startDate,
    endDate,
    roundNumber,
    description,
    countryId,
  };
};
