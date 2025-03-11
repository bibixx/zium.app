import type { Map, TrackPosition } from "../../../types/liveTiming/types/map.type";
import type { Message } from "../../../types/liveTiming/types/state.type";
import { sortUtc } from "../../../utils/liveTiming/sorting";

type StatusMessage = {
  message: string;
  color: string;
  trackColor: string;
  bySector?: boolean;
  pulse?: number;
  hex: string;
};

type MessageMap = {
  [key: string]: StatusMessage;
};

export const getTrackStatusMessage = (statusCode: number | undefined): StatusMessage | null => {
  const messageMap: MessageMap = {
    1: { message: "Track Clear", color: "bg-emerald-500", trackColor: "stroke-white", hex: "#34b981" },
    2: {
      message: "Yellow Flag",
      color: "bg-yellow-500",
      trackColor: "stroke-yellow",
      bySector: true,
      hex: "#f59e0c",
    },
    3: { message: "Flag", color: "bg-yellow-500", trackColor: "stroke-yellow", bySector: true, hex: "#f59e0c" },
    4: { message: "Safety Car", color: "bg-yellow-500", trackColor: "stroke-yellow", hex: "#f59e0c" },
    5: { message: "Red Flag", color: "bg-red-500", trackColor: "stroke-red", hex: "#ef4444" },
    6: { message: "VSC Deployed", color: "bg-yellow-500", trackColor: "stroke-yellow", hex: "#f59e0c" },
    7: { message: "VSC Ending", color: "bg-yellow-500", trackColor: "stroke-yellow", hex: "#f59e0c" },
  };

  return statusCode ? messageMap[statusCode] ?? messageMap[0] : null;
};

export const fetchMap = async (circuitKey: number): Promise<Map> => {
  const year = new Date().getFullYear();

  const mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`);

  return mapRequest.json();
};

export const rad = (deg: number) => deg * (Math.PI / 180);

export const rotate = (x: number, y: number, a: number, px: number, py: number) => {
  const c = Math.cos(rad(a));
  const s = Math.sin(rad(a));

  x -= px;
  y -= py;

  const newX = x * c - y * s;
  const newY = y * c + x * s;

  return { y: newX + px, x: newY + py };
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const findMinDistance = (point: TrackPosition, points: TrackPosition[]) => {
  let min = Infinity;
  let minIndex = -1;
  for (let i = 0; i < points.length; i++) {
    const distance = calculateDistance(point.x, point.y, points[i].x, points[i].y);
    if (distance < min) {
      min = distance;
      minIndex = i;
    }
  }
  return minIndex;
};

export type MapSector = {
  number: number;
  start: TrackPosition;
  end: TrackPosition;
  points: TrackPosition[];
};

export const createSectors = (map: Map): MapSector[] => {
  const sectors: MapSector[] = [];
  const points: TrackPosition[] = map.x.map((x, index) => ({ x, y: map.y[index] }));

  for (let i = 0; i < map.marshalSectors.length; i++) {
    sectors.push({
      number: i + 1,
      start: map.marshalSectors[i].trackPosition,
      end: map.marshalSectors[i + 1] ? map.marshalSectors[i + 1].trackPosition : map.marshalSectors[0].trackPosition,
      points: [],
    });
  }

  const dividers: number[] = sectors.map((s) => findMinDistance(s.start, points));
  for (let i = 0; i < dividers.length; i++) {
    const start = dividers[i];
    const end = dividers[i + 1] ? dividers[i + 1] : dividers[0];
    if (start < end) {
      sectors[i].points = points.slice(start, end + 1);
    } else {
      sectors[i].points = points.slice(start).concat(points.slice(0, end + 1));
    }
  }

  return sectors;
};

export const findYellowSectors = (messages: Message[] | undefined): Set<number> => {
  const msgs = messages?.sort(sortUtc).filter((msg) => {
    return msg.flag === "YELLOW" || msg.flag === "DOUBLE YELLOW" || msg.flag === "CLEAR";
  });

  if (!msgs) {
    return new Set();
  }

  const done: Set<number> = new Set();
  const sectors: Set<number> = new Set();
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    if (msg.scope === "Track" && msg.flag !== "CLEAR") {
      // Spam with sectors so all sectors are yellow no matter what
      // number of sectors there really are
      for (let j = 0; j < 100; j++) {
        sectors.add(j);
      }
      return sectors;
    }
    if (msg.scope === "Sector") {
      if (!msg.sector || done.has(msg.sector)) {
        continue;
      }
      if (msg.flag === "CLEAR") {
        done.add(msg.sector);
      } else {
        sectors.add(msg.sector);
      }
    }
  }
  return sectors;
};

type RenderedSector = {
  number: number;
  d: string;
  colorClass: string;
  strokeWidth: number;
  pulse?: number;
};

export const prioritizeColoredSectors = (a: RenderedSector, b: RenderedSector) => {
  if (a.colorClass.includes("white") && !b.colorClass.includes("white")) {
    return -1;
  }
  if (!a.colorClass.includes("white") && b.colorClass.includes("white")) {
    return 1;
  }
  return a.number - b.number;
};

export const getSectorColor = (
  sector: MapSector,
  bySector: boolean | undefined,
  trackColor: string | undefined = "stroke-white",
  yellowSectors: Set<number>,
) => (bySector ? (yellowSectors.has(sector.number) ? trackColor : "stroke-white") : trackColor);
