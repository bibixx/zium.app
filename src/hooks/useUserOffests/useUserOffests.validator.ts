import { z } from "zod";
import { validateZodValidator } from "../../utils/validators";
import { UserOffsets } from "./useUserOffests";

export const localStorageOffsetsValidator = z.object({
  additionalStreams: z.record(z.number().optional()),
  isUserDefined: z.boolean().optional().default(true),
  lastAppliedZiumOffsets: z.number().nullable().optional().default(null),
});

validateZodValidator<UserOffsets, typeof localStorageOffsetsValidator>(localStorageOffsetsValidator);
