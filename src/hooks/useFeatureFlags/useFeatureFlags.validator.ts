import { z } from "zod";
import { validateZodValidator } from "../../utils/validators";
import { FlagKeys, FlagsObject, FlagsValidator } from "./useFeatureFlags.types";
import { debugFlagTypes } from "./useFeatureFlags.constants";

const keys = Object.keys(debugFlagTypes) as FlagKeys[];
const entries = keys.map((key) => [key, debugFlagTypes[key].validator]);
const shape = Object.fromEntries(entries) as FlagsValidator;

export const flagsValidator = z.object(shape);
validateZodValidator<FlagsObject, typeof flagsValidator>(flagsValidator);
