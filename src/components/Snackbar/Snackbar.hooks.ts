import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

export const SPRING_CONSTANT = 100;
interface UseSnackbarDragArguments {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onDragStart?: () => void;
  onDragEnd?: (shouldBeCollapsed: boolean) => void;
}
export const useSnackbarDrag = ({ elementRef, onDragStart, onDragEnd }: UseSnackbarDragArguments) => {
  const hasPressedDownRef = useRef(false);
  const initialPosition = useRef<number>(0);
  const currentOffset = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    hasPressedDownRef.current = true;
    setIsMouseDown(true);
  }, []);

  const onMouseUp = useCallback(() => {
    hasPressedDownRef.current = false;
    setIsMouseDown(false);

    if (!isDragging) {
      return;
    }

    const $element = elementRef.current;

    setIsDragging(false);

    const shouldClose = currentOffset.current > 50;

    onDragEnd?.(shouldClose);
    if (!shouldClose) {
      $element?.style.removeProperty("--drag-translate-x");
    }
  }, [elementRef, isDragging, onDragEnd]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const $element = elementRef.current;

      if ($element == null) {
        return;
      }

      let internalIsDragging = isDragging;
      // Initialize dragging on first move event (to allow clicking)
      if (hasPressedDownRef.current && !isDragging) {
        setIsDragging(true);
        internalIsDragging = true;

        initialPosition.current = e.clientX;

        onDragStart?.();
      }

      if (!internalIsDragging) {
        return;
      }

      const mouseX = e.clientX;
      const targetX = mouseX - initialPosition.current;

      let smoothedTargetX = targetX;
      if (targetX < 0) {
        smoothedTargetX = targetX / SPRING_CONSTANT;
      }

      $element.style.setProperty("--drag-translate-x", `${smoothedTargetX}px`);
      currentOffset.current = targetX;
    },
    [elementRef, isDragging, onDragStart],
  );

  useEffect(() => {
    if (isDragging || isMouseDown) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.removeProperty("cursor");
    }
  }, [isDragging, isMouseDown]);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, onMouseUp]);

  return { onMouseDown, isDragging, isMouseDown };
};

export const useSnackbarTime = (totalTime: number, isPaused: boolean, onClose: () => void) => {
  const [timeProgress, setTimeProgress] = useState(0);
  const timeProgressRef = useRef(0);

  useEffect(() => {
    let start: number | undefined = undefined;
    let previousTimeStamp: number | undefined = undefined;
    let done = false;

    function step(timeStamp: number) {
      if (start === undefined) {
        start = timeStamp;
      }

      if (!isPaused && previousTimeStamp !== undefined && previousTimeStamp !== timeStamp) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const diff = timeStamp - previousTimeStamp!;
        setTimeProgress((p) => p + diff);
        timeProgressRef.current += diff;
      }

      if (done) {
        return;
      }

      if (timeProgressRef.current < totalTime) {
        previousTimeStamp = timeStamp;
        window.requestAnimationFrame(step);
      } else {
        onClose();
      }
    }

    window.requestAnimationFrame(step);

    return () => {
      done = true;
    };
  }, [isPaused, onClose, totalTime]);

  const progress = useMemo(() => 1 - timeProgress / totalTime, [timeProgress, totalTime]);
  return progress;
};

export const useSnackbarHeight = (
  onHeightChange: (height: number) => void,
  ref: MutableRefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const $element = ref.current;

    if ($element == null) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const [borderBoxSize] = entry.borderBoxSize;
      onHeightChange(borderBoxSize.blockSize);
    });

    resizeObserver.observe($element);

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
};
