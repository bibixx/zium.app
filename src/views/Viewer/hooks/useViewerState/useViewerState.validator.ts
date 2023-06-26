import { z } from "zod";
import { validateZodValidator } from "../../../../utils/validators";
import { GridWindow } from "../../../../types/GridWindow";
import type { GridLayout, WindowGridState, WindowGridSavedLayout } from "./useViewerState.utils";

const gridLayoutValidator = z.object({
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  id: z.string(),
  zIndex: z.number(),
  fillMode: z.enum(["fit", "fill"]).default("fill"),
});
validateZodValidator<GridLayout, typeof gridLayoutValidator>(gridLayoutValidator);

const gridWindowValidator = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("main"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("driver-tracker"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("data-channel"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("driver"),
    driverId: z.string(),
  }),
]);
validateZodValidator<GridWindow, typeof gridWindowValidator>(gridWindowValidator);

const windowGridSavedLayoutValidator = z.object({
  name: z.string(),
  layout: gridLayoutValidator.array(),
  windows: gridWindowValidator.array(),
});
validateZodValidator<WindowGridSavedLayout, typeof windowGridSavedLayoutValidator>(windowGridSavedLayoutValidator);

export const localStorageViewerStateValidator = z.object({
  currentLayoutIndex: z.number(),
  savedLayouts: windowGridSavedLayoutValidator.array(),
});
validateZodValidator<WindowGridState, typeof localStorageViewerStateValidator>(localStorageViewerStateValidator);
