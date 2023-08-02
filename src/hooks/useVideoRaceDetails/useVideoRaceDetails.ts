import { useCallback, useEffect, useReducer } from "react";
import { fetchRaceStreams } from "./useVideoRaceDetails.api";
import { RaceInfo, StreamsState, StreamsStateAction } from "./useVideoRaceDetails.types";
import { collectStreams, createF1OffsetsMap } from "./useVideoRaceDetails.utils";

export const useVideoRaceDetails = (raceId: string): StreamsState => {
  const [streams, dispatch] = useReducer(
    (state: StreamsState, action: StreamsStateAction): StreamsState => {
      if (action.type === "load") {
        return { state: "loading" };
      }

      if (action.type === "error") {
        return { state: "error", error: action.error };
      }

      if (action.type === "done") {
        return {
          state: "done",
          streams: action.streams,
          season: action.season,
          isLive: action.isLive,
          raceInfo: action.raceInfo,
          playbackOffsets: action.playbackOffsets,
          entitlement: action.entitlement,
        };
      }

      return state;
    },
    { state: "loading" },
  );

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      dispatch({ type: "load" });

      try {
        const { streams, season, isLive, countryId, countryName, title, playbackOffsets, genre, entitlement } =
          await fetchRaceStreams(raceId, signal);

        const collectedStreams = collectStreams(streams, season, raceId);
        const raceInfo: RaceInfo = {
          countryId,
          countryName,
          title,
          genre,
        };
        const mappedF1PlaybackOffsets = createF1OffsetsMap(playbackOffsets, season);
        console.log(mappedF1PlaybackOffsets);

        dispatch({
          type: "done",
          streams: collectedStreams,
          season,
          isLive,
          raceInfo,
          entitlement,
          playbackOffsets: {
            f1: mappedF1PlaybackOffsets,
          },
        });
      } catch (error) {
        console.error(error);

        dispatch({ type: "error", error: error as Error });
      }
    },
    [raceId],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal);

    return () => abortController.abort();
  }, [fetchData]);

  if (raceId === "__DEBUG__") {
    return debugLiveStreams;
  }

  return streams;
};

const debugLiveStreams: StreamsState & { state: "done" } = {
  state: "done",
  entitlement: "Access",
  streams: {
    defaultStreams: [
      {
        type: "f1tv",
        channelId: 1033,
        playbackUrl: "__DEBUG__",
        title: "F1 Live",
        identifier: "PRES",
      },
    ],
    driverStreams: [
      {
        type: "driver",
        channelId: 1009,
        playbackUrl: "__DEBUG__",
        title: "VER",
        identifier: "OBC",
        racingNumber: 1,
        reportingName: "VER|1",
        driverFirstName: "Max",
        driverLastName: "Verstappen",
        teamName: "Red Bull Racing",
        constructorName: "Red Bull Racing",
        hex: "#1E5BC6",
      },
      {
        type: "driver",
        channelId: 1024,
        playbackUrl: "__DEBUG__",
        title: "SAR",
        identifier: "OBC",
        racingNumber: 2,
        reportingName: "SAR|2",
        driverFirstName: "Logan",
        driverLastName: "Sargeant",
        teamName: "Williams",
        constructorName: "Williams",
        hex: "#37BEDD",
      },
      {
        type: "driver",
        channelId: 1016,
        playbackUrl: "__DEBUG__",
        title: "NOR",
        identifier: "OBC",
        racingNumber: 4,
        reportingName: "NOR|4",
        driverFirstName: "Lando",
        driverLastName: "Norris",
        teamName: "McLaren",
        constructorName: "McLaren",
        hex: "#F58020",
      },
      {
        type: "driver",
        channelId: 1012,
        playbackUrl: "__DEBUG__",
        title: "GAS",
        identifier: "OBC",
        racingNumber: 10,
        reportingName: "GAS|10",
        driverFirstName: "Pierre",
        driverLastName: "Gasly",
        teamName: "Alpine",
        constructorName: "Alpine",
        hex: "#2293D1",
      },
      {
        type: "driver",
        channelId: 1011,
        playbackUrl: "__DEBUG__",
        title: "PER",
        identifier: "OBC",
        racingNumber: 11,
        reportingName: "PER|11",
        driverFirstName: "Sergio",
        driverLastName: "Perez",
        teamName: "Red Bull Racing",
        constructorName: "Red Bull Racing",
        hex: "#1E5BC6",
      },
      {
        type: "driver",
        channelId: 1018,
        playbackUrl: "__DEBUG__",
        title: "ALO",
        identifier: "OBC",
        racingNumber: 14,
        reportingName: "ALO|14",
        driverFirstName: "Fernando",
        driverLastName: "Alonso",
        teamName: "Aston Martin",
        constructorName: "Aston Martin",
        hex: "#2D826D",
      },
      {
        type: "driver",
        channelId: 1008,
        playbackUrl: "__DEBUG__",
        title: "LEC",
        identifier: "OBC",
        racingNumber: 16,
        reportingName: "LEC|16",
        driverFirstName: "Charles",
        driverLastName: "Leclerc",
        teamName: "Ferrari",
        constructorName: "Ferrari",
        hex: "#ED1C24",
      },
      {
        type: "driver",
        channelId: 1017,
        playbackUrl: "__DEBUG__",
        title: "STR",
        identifier: "OBC",
        racingNumber: 18,
        reportingName: "STR|18",
        driverFirstName: "Lance",
        driverLastName: "Stroll",
        teamName: "Aston Martin",
        constructorName: "Aston Martin",
        hex: "#2D826D",
      },
      {
        type: "driver",
        channelId: 1013,
        playbackUrl: "__DEBUG__",
        title: "MAG",
        identifier: "OBC",
        racingNumber: 20,
        reportingName: "MAG|20",
        driverFirstName: "Kevin",
        driverLastName: "Magnussen",
        teamName: "Haas F1 Team",
        constructorName: "Haas",
        hex: "#B6BABD",
      },
      {
        type: "driver",
        channelId: 1021,
        playbackUrl: "__DEBUG__",
        title: "DEV",
        identifier: "OBC",
        racingNumber: 21,
        reportingName: "DEV|21",
        driverFirstName: "Nyck",
        driverLastName: "De Vries",
        teamName: "AlphaTauri",
        constructorName: "AlphaTauri",
        hex: "#4E7C9B",
      },
      {
        type: "driver",
        channelId: 1022,
        playbackUrl: "__DEBUG__",
        title: "TSU",
        identifier: "OBC",
        racingNumber: 22,
        reportingName: "TSU|22",
        driverFirstName: "Yuki",
        driverLastName: "Tsunoda",
        teamName: "AlphaTauri",
        constructorName: "AlphaTauri",
        hex: "#4E7C9B",
      },
      {
        type: "driver",
        channelId: 1023,
        playbackUrl: "__DEBUG__",
        title: "ALB",
        identifier: "OBC",
        racingNumber: 23,
        reportingName: "ALB|23",
        driverFirstName: "Alexander",
        driverLastName: "Albon",
        teamName: "Williams",
        constructorName: "Williams",
        hex: "#37BEDD",
      },
      {
        type: "driver",
        channelId: 1020,
        playbackUrl: "__DEBUG__",
        title: "ZHO",
        identifier: "OBC",
        racingNumber: 24,
        reportingName: "ZHO|24",
        driverFirstName: "Guanyu",
        driverLastName: "Zhou",
        teamName: "Alfa Romeo",
        constructorName: "Alfa Romeo",
        hex: "#B12039",
      },
      {
        type: "driver",
        channelId: 1014,
        playbackUrl: "__DEBUG__",
        title: "HUL",
        identifier: "OBC",
        racingNumber: 27,
        reportingName: "HUL|27",
        driverFirstName: "Nico",
        driverLastName: "Hulkenberg",
        teamName: "Haas F1 Team",
        constructorName: "Haas",
        hex: "#B6BABD",
      },
      {
        type: "driver",
        channelId: 1005,
        playbackUrl: "__DEBUG__",
        title: "OCO",
        identifier: "OBC",
        racingNumber: 31,
        reportingName: "OCO|31",
        driverFirstName: "Esteban",
        driverLastName: "Ocon",
        teamName: "Alpine",
        constructorName: "Alpine",
        hex: "#2293D1",
      },
      {
        type: "driver",
        channelId: 1010,
        playbackUrl: "__DEBUG__",
        title: "HAM",
        identifier: "OBC",
        racingNumber: 44,
        reportingName: "HAM|44",
        driverFirstName: "Lewis",
        driverLastName: "Hamilton",
        teamName: "Mercedes",
        constructorName: "Mercedes",
        hex: "#6CD3BF",
      },
      {
        type: "driver",
        channelId: 1007,
        playbackUrl: "__DEBUG__",
        title: "SAI",
        identifier: "OBC",
        racingNumber: 55,
        reportingName: "SAI|55",
        driverFirstName: "Carlos",
        driverLastName: "Sainz",
        teamName: "Ferrari",
        constructorName: "Ferrari",
        hex: "#ED1C24",
      },
      {
        type: "driver",
        channelId: 1006,
        playbackUrl: "__DEBUG__",
        title: "RUS",
        identifier: "OBC",
        racingNumber: 63,
        reportingName: "RUS|63",
        driverFirstName: "George",
        driverLastName: "Russell",
        teamName: "Mercedes",
        constructorName: "Mercedes",
        hex: "#6CD3BF",
      },
      {
        type: "driver",
        channelId: 1019,
        playbackUrl: "__DEBUG__",
        title: "BOT",
        identifier: "OBC",
        racingNumber: 77,
        reportingName: "BOT|77",
        driverFirstName: "Valtteri",
        driverLastName: "Bottas",
        teamName: "Alfa Romeo",
        constructorName: "Alfa Romeo",
        hex: "#B12039",
      },
      {
        type: "driver",
        channelId: 1015,
        playbackUrl: "__DEBUG__",
        title: "PIA",
        identifier: "OBC",
        racingNumber: 81,
        reportingName: "PIA|81",
        driverFirstName: "Oscar",
        driverLastName: "Piastri",
        teamName: "McLaren",
        constructorName: "McLaren",
        hex: "#F58020",
      },
    ],
    driverTrackerStream: {
      type: "driver-tracker",
      channelId: 1003,
      playbackUrl: "__DEBUG__",
      title: "Driver Tracker",
      identifier: "TRACKER",
    },
    dataChannelStream: {
      type: "data-channel",
      channelId: 1004,
      playbackUrl: "__DEBUG__",
      title: "Data Channel",
      identifier: "DATA",
    },
  },
  season: 2023,
  isLive: true,
  raceInfo: {
    countryId: "1",
    countryName: "Debug",
    title: "Debug",
    genre: "race",
  },
  playbackOffsets: {
    f1: {},
  },
};
