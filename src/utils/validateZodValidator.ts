import { ZodType } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateZodValidator = <T, U extends ZodType<any, any, any>>(_a: U["_output"] extends T ? U : never) =>
  undefined;
