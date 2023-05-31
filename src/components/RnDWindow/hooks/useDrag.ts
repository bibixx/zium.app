import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { boundTo } from "../../../utils/boundTo";
import { Position, Size } from "../RnDWindow.types";
import { roundToNearest } from "../RnDWindow.utils";
import { getTransform } from "../utils/getTransform";

interface UseDragArguments {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onDragStart: () => void;
  onDragEnd: (position: Position) => void;
  grid: [number, number];
}
export const useDrag = ({ elementRef, onDragStart, onDragEnd, grid }: UseDragArguments) => {
  const hasPressedDownRef = useRef(false);
  const initialSize = useRef<Size>({ width: 0, height: 0 });
  const cursorOffset = useRef<Position>({ x: 0, y: 0 });
  const currentPosition = useRef<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    setIsMouseDown(true);
    hasPressedDownRef.current = true;
  }, []);

  const onMouseUp = useCallback(() => {
    hasPressedDownRef.current = false;
    setIsMouseDown(false);

    if (!isDragging) {
      return;
    }

    setIsDragging(false);
    onDragEnd(currentPosition.current);
  }, [isDragging, onDragEnd]);

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

        const { top, left, width, height } = $element.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const xOffset = left - mouseX;
        const yOffset = top - mouseY;

        cursorOffset.current = {
          x: xOffset,
          y: yOffset,
        };
        initialSize.current = {
          width,
          height,
        };

        onDragStart();
      }

      if (!internalIsDragging) {
        return;
      }

      const { x: cursorOffsetX, y: cursorOffsetY } = cursorOffset.current;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const targetX = mouseX + cursorOffsetX;
      const targetY = mouseY + cursorOffsetY;

      const { width: currentWidth, height: currentHeight } = initialSize.current;
      const [gridXStep, gridYStep] = grid;

      // Horizontal movement
      const nearestLeftGrid = boundTo(roundToNearest(targetX, gridXStep, "down"), 0, window.innerWidth - currentWidth);
      const nearestRightGrid = boundTo(
        roundToNearest(targetX + currentWidth, gridXStep, "down"),
        currentWidth,
        window.innerWidth,
      );
      const nearestLeftGridDelta = Math.abs(nearestLeftGrid - targetX);
      const nearestRightGridDelta = Math.abs(nearestRightGrid - (targetX + currentWidth));

      // prettier-ignore
      const newX = nearestLeftGridDelta < nearestRightGridDelta
        ? nearestLeftGrid
        : nearestRightGrid - currentWidth;

      // Vertical movement
      const nearestTopGrid = boundTo(roundToNearest(targetY, gridYStep, "down"), 0, window.innerHeight - currentHeight);
      const nearestBottomGrid = boundTo(
        roundToNearest(targetY + currentHeight, gridYStep, "down"),
        currentHeight,
        window.innerHeight,
      );
      const nearestTopGridDelta = Math.abs(nearestTopGrid - targetY);
      const nearestBottomGridDelta = Math.abs(nearestBottomGrid - (targetY + currentHeight));

      // prettier-ignore
      const newY = nearestTopGridDelta < nearestBottomGridDelta
        ? nearestTopGrid
        : nearestBottomGrid - currentHeight;

      $element.style.transform = getTransform(newX, newY);
      currentPosition.current = { x: newX, y: newY };
    },
    [elementRef, grid, isDragging, onDragStart],
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
