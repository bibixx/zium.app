import { z, ZodType } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateZodValidator = <T, U extends ZodType<any, any, any>>(_a: z.output<U> extends T ? U : never) =>
  undefined;

export const validateArray =
  <T extends ZodType<any, any, any>>(validator: T) =>
  <U>(acc: z.output<T>[], data: U): z.output<T>[] => {
    const result = validator.safeParse(data);

    if (!result.success) {
      return acc;
    }

    acc.push(result.data);

    return acc;
  };

/* eslint-enable @typescript-eslint/no-explicit-any */
