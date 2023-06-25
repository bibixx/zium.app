import { z } from "zod";
import { validateZodValidator } from "../../utils/validateZodValidator";
import { UserOffsets } from "./useUserOffests";

export const localStorageOffsetsValidator = z.object({}).catchall(z.number());
validateZodValidator<UserOffsets, typeof localStorageOffsetsValidator>(localStorageOffsetsValidator);
