export type StreamVideoState =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "done"; data: string };

export type StreamVideoStateAction =
  | { type: "load" }
  | { type: "error"; error: string }
  | { type: "done"; data: string };
