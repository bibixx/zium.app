import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { Position } from "../RnDWindow.types";
import { getTransform } from "../utils/getTransform";

interface UseDragArguments {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onDragEnd: (position: Position) => void;
}
export const useDrag = ({ elementRef, onDragEnd }: UseDragArguments) => {
  const hasPressedDownRef = useRef(false);
  const cursorOffset = useRef<Position>({ x: 0, y: 0 });
  const currentPosition = useRef<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback(() => {
    hasPressedDownRef.current = true;
  }, []);

  const onMouseUp = useCallback(() => {
    hasPressedDownRef.current = false;

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
      if (hasPressedDownRef.current && !isDragging) {
        setIsDragging(true);
        internalIsDragging = true;

        const { top, left } = $element.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const xOffset = left - mouseX;
        const yOffset = top - mouseY;

        cursorOffset.current = {
          x: xOffset,
          y: yOffset,
        };
      }

      if (!internalIsDragging) {
        return;
      }

      const { x: cursorOffsetX, y: cursorOffsetY } = cursorOffset.current;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newX = mouseX + cursorOffsetX;
      const newY = mouseY + cursorOffsetY;

      $element.style.transform = getTransform(newX, newY);
      currentPosition.current = { x: newX, y: newY };
    },
    [elementRef, isDragging],
  );

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.removeProperty("cursor");
    }
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, onMouseUp]);

  return { onMouseDown, isDragging };
};
