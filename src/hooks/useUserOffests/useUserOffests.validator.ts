import { z } from "zod";
import { validateZodValidator } from "../../utils/validators";
import { UserOffsets } from "./useUserOffests";

export const localStorageOffsetsValidator = z.object({
  additionalStreams: z.record(z.number()),
});

validateZodValidator<UserOffsets, typeof localStorageOffsetsValidator>(localStorageOffsetsValidator);
