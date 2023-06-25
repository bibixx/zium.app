import { z } from "zod";
import { validateZodValidator } from "../../../../utils/validateZodValidator";
import {
  DataChannelGridWindow,
  DriverGridWindow,
  DriverTrackerGridWindow,
  MainGridWindow,
} from "../../../../types/GridWindow";
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

const mainGridWindowValidator = z.object({
  id: z.string(),
  type: z.literal("main"),
});
validateZodValidator<MainGridWindow, typeof mainGridWindowValidator>(mainGridWindowValidator);

const driverTrackerGridWindowValidator = z.object({
  id: z.string(),
  type: z.literal("driver-tracker"),
});
validateZodValidator<DriverTrackerGridWindow, typeof driverTrackerGridWindowValidator>(
  driverTrackerGridWindowValidator,
);

const dataChannelGridWindowValidator = z.object({
  id: z.string(),
  type: z.literal("data-channel"),
});
validateZodValidator<DataChannelGridWindow, typeof dataChannelGridWindowValidator>(dataChannelGridWindowValidator);

const driverGridWindowValidator = z.object({
  id: z.string(),
  type: z.literal("driver"),
  driverId: z.string(),
});
validateZodValidator<DriverGridWindow, typeof driverGridWindowValidator>(driverGridWindowValidator);

const gridWindowValidator = z.union([
  mainGridWindowValidator,
  driverTrackerGridWindowValidator,
  dataChannelGridWindowValidator,
  driverGridWindowValidator,
]);

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
