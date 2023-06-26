import { z } from "zod";

export const ziumOffsetsValidator = z.object({
  timestamp: z.number(),
  data: z.record(z.number()),
});
