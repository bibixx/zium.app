import { z } from "zod";

export const ziumOffsetsValidator = z.object({
  timestamp: z.number(),
  additionalStreams: z.record(z.number().optional()),
});
