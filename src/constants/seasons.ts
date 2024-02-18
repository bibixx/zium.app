export const SUPPORTED_SEASONS = [
  "2024",
  "2023",
  "2022",
  "2021",
  // "2020",
  // "2019",
  // "2018",
  // "2017",
  // "2016",
  // "2015",
  // "2014",
  // "2013",
  // "2012",
  // "2011",
  // "2010",
  // "2009",
  // "2008",
  // "2007",
  // "2006",
  // "2005",
  // "2004",
  // "2003",
  // "2002",
  // "2001",
  // "2000",
  // "1999",
  // "1998",
  // "1997",
  // "1996",
  // "1995",
  // "1994",
  // "1993",
  // "1992",
  // "1991",
  // "1990",
  // "1989",
  // "1988",
  // "1987",
  // "1986",
  // "1985",
  // "1984",
  // "1983",
  // "1982",
  // "1981",
] as const;
export type SupportedSeasons = (typeof SUPPORTED_SEASONS)[number];
export const SEASON_TO_F1_ID_MAP: Record<SupportedSeasons, string> = {
  "2024": "8192",
  "2023": "6603",
  "2022": "4319",
  "2021": "1510",
  // "2020": "392",
  // "2019": "2128",
  // "2018": "2130",
  // "2017": "616",
  // "2016": "725",
  // "2015": "727",
  // "2014": "729",
  // "2013": "924",
  // "2012": "926",
  // "2011": "928",
  // "2010": "930",
  // "2009": "932",
  // "2008": "934",
  // "2007": "936",
  // "2006": "937",
  // "2005": "941",
  // "2004": "950",
  // "2003": "952",
  // "2002": "954",
  // "2001": "956",
  // "2000": "960",
  // "1999": "962",
  // "1998": "965",
  // "1997": "967",
  // "1996": "969",
  // "1995": "971",
  // "1994": "973",
  // "1993": "975",
  // "1992": "977",
  // "1991": "979",
  // "1990": "981",
  // "1989": "983",
  // "1988": "986",
  // "1987": "988",
  // "1986": "990",
  // "1985": "993",
  // "1984": "995",
  // "1983": "997",
  // "1982": "999",
  // "1981": "1002",
};

export const COMING_SOON_SEASONS_DATA: Partial<Record<SupportedSeasons, Date>> = {
  "2022": new Date(2022, 2, 3),
  "2023": new Date(2023, 2, 3),
  "2024": new Date(2024, 1, 21),
};

export const LATEST_SEASON = Object.entries(COMING_SOON_SEASONS_DATA).sort(
  ([, a], [, b]) => b.getTime() - a.getTime(),
)[0][0];
