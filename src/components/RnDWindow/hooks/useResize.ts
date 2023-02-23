import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { Position, Size } from "../RnDWindow.types";
import { getTransform } from "../utils/getTransform";

type HandleSide = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
interface UseResize {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onResizeEnd: (size: Size, position: Position) => void;
}
export const useResize = ({ elementRef, onResizeEnd }: UseResize) => {
  const [isResizing, setIsResizing] = useState(false);
  const handleSideRef = useRef<HandleSide | null>(null);

  const initialCursorPositionRef = useRef<Position>({ x: 0, y: 0 });

  const initialSizeRef = useRef<Size>({ width: 0, height: 0 });
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 });

  const currentSizeRef = useRef<Size>({ width: 0, height: 0 });
  const currentPositionRef = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (handleSide: HandleSide) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSideRef.current = handleSide;
      setIsResizing(true);

      const $element = elementRef.current;
      if ($element == null) {
        return;
      }

      const { x, y, width, height } = $element.getBoundingClientRect();
      initialSizeRef.current = { width, height };
      initialPositionRef.current = { x, y };

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      initialCursorPositionRef.current = { x: mouseX, y: mouseY };
    },
    [elementRef],
  );

  const onMouseUp = useCallback(() => {
    if (isResizing) {
      onResizeEnd(currentSizeRef.current, currentPositionRef.current);
    }

    setIsResizing(false);
  }, [isResizing, onResizeEnd]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) {
        return;
      }

      const $element = elementRef.current;
      if ($element == null) {
        return;
      }

      const { x: oldMouseX, y: oldMouseY } = initialCursorPositionRef.current;
      const { width: initialWidth, height: initialHeight } = initialSizeRef.current;
      const { x: initialX, y: initialY } = initialPositionRef.current;

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const mouseDeltaX = mouseX - oldMouseX;
      const mouseDeltaY = mouseY - oldMouseY;

      const isXResizeEnabled = shouldXResizeBeEnabled(handleSideRef.current);
      const isYResizeEnabled = shouldYResizeBeEnabled(handleSideRef.current);
      const isAdjustingXPosition = shouldAdjustXPosition(handleSideRef.current);
      const isAdjustingYPosition = shouldAdjustYPosition(handleSideRef.current);

      const widthDelta = isXResizeEnabled ? getSizeDelta(mouseDeltaX, isAdjustingXPosition) : 0;
      const heightDelta = isYResizeEnabled ? getSizeDelta(mouseDeltaY, isAdjustingYPosition) : 0;

      const width = initialWidth + widthDelta;
      const height = initialHeight + heightDelta;

      const xDelta = isAdjustingXPosition ? mouseDeltaX : 0;
      const yDelta = isAdjustingYPosition ? mouseDeltaY : 0;
      const x = initialX + xDelta;
      const y = initialY + yDelta;

      $element.style.width = `${width}px`;
      $element.style.height = `${height}px`;
      $element.style.transform = getTransform(x, y);

      currentSizeRef.current = {
        width,
        height,
      };
      currentPositionRef.current = {
        x,
        y,
      };
    },
    [elementRef, isResizing],
  );

  useEffect(() => {
    const $element = elementRef.current;

    if ($element == null) {
      return;
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [elementRef, onMouseMove, onMouseUp]);

  return { onMouseDown };
};

const shouldXResizeBeEnabled = (handleSize: HandleSide | null) => {
  if (handleSize === null) {
    return false;
  }

  const xResizeSides: HandleSide[] = ["e", "w", "nw", "ne", "sw", "se"];
  return xResizeSides.includes(handleSize);
};

const shouldYResizeBeEnabled = (handleSize: HandleSide | null) => {
  if (handleSize === null) {
    return false;
  }

  const xResizeSides: HandleSide[] = ["n", "s", "nw", "ne", "sw", "se"];
  return xResizeSides.includes(handleSize);
};

const shouldAdjustXPosition = (handleSize: HandleSide | null) => {
  if (handleSize === null) {
    return false;
  }

  const xResizeSides: HandleSide[] = ["w", "nw", "sw"];
  return xResizeSides.includes(handleSize);
};

const shouldAdjustYPosition = (handleSize: HandleSide | null) => {
  if (handleSize === null) {
    return false;
  }

  const xResizeSides: HandleSide[] = ["n", "nw", "ne"];
  return xResizeSides.includes(handleSize);
};

const getSizeDelta = (mouseDelta: number, shouldFlip: boolean) => mouseDelta * (shouldFlip ? -1 : 1);
