import { useRef } from "react";

import { RecursivePartial } from "../../../types/liveTiming/types/message.type";
import { useBuffer } from "./useBuffer";
import { merge } from "./useStatefulBuffer.utils";

export const useStatefulBuffer = <T>() => {
  const currentRef = useRef<T | null>(null);
  const buffer = useBuffer<T>();

  const set = (data: T) => {
    currentRef.current = data;
    buffer.set(data);
  };

  const push = (update: RecursivePartial<T>) => {
    currentRef.current = merge(currentRef.current ?? {}, update);
    if (currentRef.current) buffer.push(currentRef.current);
  };

  return {
    set,
    push,
    latest: buffer.latest,
    delayed: buffer.delayed,
    cleanup: buffer.cleanup,
    maxDelay: buffer.maxDelay,
  };
};
