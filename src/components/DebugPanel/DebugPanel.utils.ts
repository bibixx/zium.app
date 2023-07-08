import { output } from "zod";
import { getInitialOffsets } from "../../hooks/useUserOffests/useUserOffests.utils";
import { WindowGridState } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { ziumOffsetsValidator } from "../../views/Viewer/hooks/useZiumOffsets/useZiumOffsets.validator";
import { getDefaultState } from "../../views/Viewer/hooks/useViewerState/useViewerState.defaultState";

export function getLorem(max = Infinity) {
  const fullLorem =
    "Ipsam ea voluptate nostrum cupiditate quo voluptatibus laborum sunt maiores id sequi. Deleniti nobis et natus asperiores doloremque quis aperiam voluptates iusto excepturi eius facere dolorum. Molestiae debitis eaque praesentium quia ex eum exercitationem sequi ut magnam maxime sunt asperiores cumque. Exercitationem ipsam ad quisquam velit itaque et doloribus delectus natus. Alias tempore iusto dolorem facilis ut corporis assumenda repellat itaque sint repellendus. Doloribus est enim et voluptatem cupiditate autem sint voluptatibus.";

  return fullLorem[0] + fullLorem.slice(1, Math.floor(Math.random() * Math.min(fullLorem.length, max)));
}

export const debugStore: WindowGridState = {
  currentLayoutIndex: 0,
  savedLayouts: [
    ...getDefaultState().savedLayouts,
    {
      name: "Offsets",
      layout: [
        {
          width: 14.285714285714286,
          height: 25,
          x: 71.42857142857143,
          y: 0,
          id: "3f7e9i",
          zIndex: 0,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 85.71428571428572,
          y: 0,
          id: "jp4azy",
          zIndex: 1,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 42.85714285714286,
          y: 25,
          id: "u8dw0e",
          zIndex: 2,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 57.142857142857146,
          y: 25,
          id: "psltt5",
          zIndex: 3,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 71.42857142857143,
          y: 25,
          id: "t9ie4d",
          zIndex: 4,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 85.71428571428572,
          y: 25,
          id: "jv8vwe",
          zIndex: 5,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 28.571428571428573,
          y: 50,
          id: "m07cw3",
          zIndex: 6,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 42.85714285714286,
          y: 50,
          id: "x446r9",
          zIndex: 7,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 57.142857142857146,
          y: 50,
          id: "khe6j5",
          zIndex: 8,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 71.42857142857143,
          y: 50,
          id: "c12ygk",
          zIndex: 9,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 85.71428571428572,
          y: 50,
          id: "i37h97",
          zIndex: 10,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 28.571428571428573,
          y: 75,
          id: "geq8uu",
          zIndex: 11,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 42.85714285714286,
          y: 75,
          id: "afxyod",
          zIndex: 12,
          fillMode: "fill",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 57.142857142857146,
          y: 75,
          id: "lrgcxl",
          zIndex: 13,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 71.42857142857143,
          y: 75,
          id: "g9ojfv",
          zIndex: 14,
          fillMode: "fit",
        },
        {
          width: 14.285714285714286,
          height: 25,
          x: 85.71428571428572,
          y: 75,
          id: "b6p4je",
          zIndex: 15,
          fillMode: "fit",
        },
        {
          width: 28.499999999999996,
          height: 42.62487104539202,
          x: 0,
          y: 0.1251283669242177,
          id: "b1rfqr",
          zIndex: 16,
          fillMode: "fit",
        },
        {
          width: 28.499755859374996,
          height: 29.249998488813176,
          x: 0,
          y: 42.75000151118682,
          id: "4kxscy",
          zIndex: 17,
          fillMode: "fit",
        },
        {
          width: 28.499755859374996,
          height: 27.99957183040321,
          x: 0,
          y: 72,
          id: "1vk1sb",
          zIndex: 18,
          fillMode: "fit",
        },
        {
          width: 14.285714285714288,
          height: 25,
          x: 28.499999999999996,
          y: 0,
          id: "u8dw0f",
          zIndex: 19,
          fillMode: "fit",
        },
        {
          width: 14.285714285714288,
          height: 25,
          x: 28.499999999999996,
          y: 24.749999999999996,
          id: "1ziihg",
          zIndex: 20,
          fillMode: "fit",
        },
        {
          width: 14.285714285714288,
          height: 25,
          x: 56.96451822916665,
          y: 0,
          id: "ral762",
          zIndex: 21,
          fillMode: "fit",
        },
        { width: 14.285714285714288, height: 25, x: 42.75, y: 0, id: "hp66b3", zIndex: 22, fillMode: "fit" },
      ],
      windows: [
        { id: "b1rfqr", type: "main" },
        { id: "u8dw0f", type: "driver", driverId: "VER" },
        { id: "hp66b3", type: "driver", driverId: "SAR" },
        { id: "ral762", type: "driver", driverId: "NOR" },
        { id: "3f7e9i", type: "driver", driverId: "GAS" },
        { id: "jp4azy", type: "driver", driverId: "PER" },
        { id: "1ziihg", type: "driver", driverId: "ALO" },
        { id: "u8dw0e", type: "driver", driverId: "LEC" },
        { id: "psltt5", type: "driver", driverId: "STR" },
        { id: "t9ie4d", type: "driver", driverId: "MAG" },
        { id: "jv8vwe", type: "driver", driverId: "DEV" },
        { id: "m07cw3", type: "driver", driverId: "TSU" },
        { id: "x446r9", type: "driver", driverId: "ALB" },
        { id: "khe6j5", type: "driver", driverId: "ZHO" },
        { id: "c12ygk", type: "driver", driverId: "HUL" },
        { id: "i37h97", type: "driver", driverId: "OCO" },
        { id: "geq8uu", type: "driver", driverId: "HAM" },
        { id: "afxyod", type: "driver", driverId: "SAI" },
        { id: "lrgcxl", type: "driver", driverId: "RUS" },
        { id: "g9ojfv", type: "driver", driverId: "BOT" },
        { id: "b6p4je", type: "driver", driverId: "PIA" },
        { id: "4kxscy", type: "driver-tracker" },
        { id: "1vk1sb", type: "data-channel" },
      ],
    },
  ],
};

function downloadFile(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

type ZiumOffsetsResponse = output<typeof ziumOffsetsValidator>;
export const downloadOffsetsForCurrentRace = (raceId: string, showErrorSnackbar: () => void) => {
  const offsets = getInitialOffsets(raceId);
  if (offsets == null) {
    showErrorSnackbar();
    return;
  }

  const data: ZiumOffsetsResponse = {
    additionalStreams: offsets.additionalStreams,
    timestamp: Date.now(),
  };

  const output = JSON.stringify(data);

  downloadFile(`${raceId}.json`, output);
};
