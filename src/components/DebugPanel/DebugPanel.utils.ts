import { output } from "zod";
import { getInitialOffsets } from "../../hooks/useUserOffests/useUserOffests.utils";
import { WindowGridState } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { ziumOffsetsValidator } from "../../views/Viewer/hooks/useZiumOffsets/useZiumOffsets.validator";

export function getLorem(max = Infinity) {
  const fullLorem =
    "Ipsam ea voluptate nostrum cupiditate quo voluptatibus laborum sunt maiores id sequi. Deleniti nobis et natus asperiores doloremque quis aperiam voluptates iusto excepturi eius facere dolorum. Molestiae debitis eaque praesentium quia ex eum exercitationem sequi ut magnam maxime sunt asperiores cumque. Exercitationem ipsam ad quisquam velit itaque et doloribus delectus natus. Alias tempore iusto dolorem facilis ut corporis assumenda repellat itaque sint repellendus. Doloribus est enim et voluptatem cupiditate autem sint voluptatibus.";

  return fullLorem[0] + fullLorem.slice(1, Math.floor(Math.random() * Math.min(fullLorem.length, max)));
}

export const debugStore: WindowGridState = {
  currentLayoutIndex: 0,
  savedLayouts: [
    {
      name: "Race (21:9)",
      layout: [
        {
          width: 21.99951171875,
          height: 33.625,
          x: 77.99999872843425,
          y: 66.375,
          id: "u8dw0f",
          zIndex: 0,
          fillMode: "fill",
        },
        {
          width: 21.999918619791668,
          height: 32.625,
          x: 77.99999872843425,
          y: 33.75,
          id: "hp66b3",
          zIndex: 1,
          fillMode: "fill",
        },
        {
          width: 22.499593098958336,
          height: 33.625,
          x: 55.500405629475914,
          y: 66.375,
          id: "ral762",
          zIndex: 2,
          fillMode: "fill",
        },
        {
          width: 22.499593098958336,
          height: 32.625,
          x: 55.500405629475914,
          y: 33.75,
          id: "3f7e9i",
          zIndex: 3,
          fillMode: "fill",
        },
        { width: 16.875, height: 23.5, x: 0, y: 76.5, id: "nlgk61", zIndex: 4, fillMode: "fill" },
        {
          width: 19.87475713094076,
          height: 23.5,
          x: 35.62499999999999,
          y: 76.5,
          id: "u8dw0e",
          zIndex: 5,
          fillMode: "fill",
        },
        { width: 18.749999999999993, height: 23.5, x: 16.875, y: 76.5, id: "1ziihg", zIndex: 6, fillMode: "fill" },
        {
          width: 55.49967447916667,
          height: 76.49991461748868,
          x: 0,
          y: 0,
          id: "b1rfqr",
          zIndex: 7,
          fillMode: "fill",
        },
        {
          width: 26.8115234375,
          height: 33.75,
          x: 55.50097783406576,
          y: 0,
          id: "i1bglj",
          zIndex: 8,
          fillMode: "fill",
        },
        {
          width: 21.99951171875,
          height: 33.7490234375,
          x: 77.99999999999999,
          y: 0,
          id: "jp4azy",
          zIndex: 9,
          fillMode: "fill",
        },
      ],
      windows: [
        { id: "b1rfqr", type: "main" },
        { id: "nlgk61", type: "driver-tracker" },
        { id: "i1bglj", type: "data-channel" },
        { id: "jp4azy", type: "driver", driverId: "HAM" },
        { id: "3f7e9i", type: "driver", driverId: "ALO" },
        { id: "ral762", type: "driver", driverId: "BOT" },
        { id: "hp66b3", type: "driver", driverId: "LEC" },
        { id: "1ziihg", type: "driver", driverId: "OCO" },
        { id: "u8dw0e", type: "driver", driverId: "NOR" },
        { id: "u8dw0f", type: "driver", driverId: "PER" },
      ],
    },
    {
      name: "Race (16:10)",
      layout: [
        {
          width: 37,
          height: 31.374674768261546,
          x: 63,
          y: 68.62549800796812,
          id: "hp66b3",
          zIndex: 0,
          fillMode: "fill",
        },
        {
          width: 45,
          height: 40.373834369449376,
          x: 18,
          y: 59.626165630550624,
          id: "6yk6fv",
          zIndex: 1,
          fillMode: "fit",
        },
        { width: 37, height: 33.75, x: 63, y: 0, id: "jp4azy", zIndex: 2, fillMode: "fill" },
        { width: 37, height: 34.747806095102966, x: 63, y: 33.75, id: "u8dw0e", zIndex: 3, fillMode: "fill" },
        { width: 63, height: 59.62500000000001, x: 0, y: 0, id: "b1rfqr", zIndex: 4, fillMode: "fill" },
      ],
      windows: [
        { id: "b1rfqr", type: "main" },
        { id: "jp4azy", type: "driver", driverId: "SAI" },
        { id: "hp66b3", type: "driver", driverId: "ALO" },
        { id: "u8dw0e", type: "driver", driverId: "VER" },
        { id: "6yk6fv", type: "data-channel" },
      ],
    },
    {
      name: "Quali (21:9)",
      layout: [
        { width: 67.5, height: 92.25, x: 0, y: 0, id: "b1rfqr", zIndex: 0, fillMode: "fill" },
        { width: 32.499593098958336, height: 46, x: 67.5, y: 46.25, id: "nlgk61", zIndex: 1, fillMode: "fill" },
        { width: 32.5, height: 43.875, x: 67.5, y: 2.25, id: "i1bglj", zIndex: 2, fillMode: "fill" },
      ],
      windows: [
        { id: "b1rfqr", type: "main" },
        { id: "nlgk61", type: "driver-tracker" },
        { id: "i1bglj", type: "data-channel" },
      ],
    },
    {
      name: "Quali (16:10)",
      layout: [
        {
          width: 75.375,
          height: 66.24944493783303,
          x: 0,
          y: 33.75055506216697,
          id: "b1rfqr",
          zIndex: 0,
          fillMode: "fill",
        },
        { width: 37, height: 33.62413938261476, x: 0.125, y: 0, id: "i1bglj", zIndex: 1, fillMode: "fill" },
      ],
      windows: [
        { id: "b1rfqr", type: "main" },
        { id: "i1bglj", type: "data-channel" },
      ],
    },
    {
      name: "Full Screen",
      layout: [{ width: 100, height: 100, x: 0, y: 0, id: "b1rfqr", zIndex: 0, fillMode: "fit" }],
      windows: [{ id: "b1rfqr", type: "main" }],
    },
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
