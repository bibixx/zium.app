import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useWindowSizeRef } from "../../../hooks/useWindowSize";
import { BOTTOM_SPRING_CONSTANT, PLAYER_HEIGHT, PLAYER_MARGIN, TOP_SPRING_CONSTANT } from "../Player.constants";

interface UsePlayerDragArguments {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onDragStart?: () => void;
  onClick?: () => void;
  onDragEnd?: (shouldBeCollapsed: boolean) => void;
  playerCollapsedZone: number;
}
export const usePlayerDrag = ({
  elementRef,
  onDragStart,
  onDragEnd,
  onClick,
  playerCollapsedZone,
}: UsePlayerDragArguments) => {
  const hasPressedDownRef = useRef(false);
  const initialOffset = useRef<number>(0);
  const currentPosition = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const clickEventTarget = useRef<EventTarget | null>(null);
  const windowSizeRef = useWindowSizeRef();

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    clickEventTarget.current = e.currentTarget;
    hasPressedDownRef.current = true;
  }, []);

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      hasPressedDownRef.current = false;

      if (!isDragging) {
        if (shouldTriggerClick(clickEventTarget.current, e.target)) {
          onClick?.();
        }

        return;
      }

      const $element = elementRef.current;
      $element?.style.removeProperty("--translate-y");
      setIsDragging(false);

      const positionY = currentPosition.current;
      const windowHeight = windowSizeRef.current.height;
      const shouldBeCollapsed = positionY > windowHeight - playerCollapsedZone;
      onDragEnd?.(shouldBeCollapsed);
    },
    [elementRef, isDragging, onClick, onDragEnd, playerCollapsedZone, windowSizeRef],
  );

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

        const { top } = $element.getBoundingClientRect();
        const mouseY = e.clientY;
        const yOffset = top - mouseY;
        initialOffset.current = yOffset;

        onDragStart?.();
      }

      if (!internalIsDragging) {
        return;
      }

      const mouseY = e.clientY;
      const cursorOffsetY = initialOffset.current;
      const targetY = mouseY + cursorOffsetY;

      const windowHeight = windowSizeRef.current.height;
      const topEdge = windowHeight - PLAYER_HEIGHT - PLAYER_MARGIN;

      let smoothedTargetY = targetY;
      if (targetY < topEdge) {
        const diffFromTopEdge = topEdge - targetY;
        smoothedTargetY = topEdge - diffFromTopEdge / TOP_SPRING_CONSTANT;
      }

      const bottomEdge = windowHeight - PLAYER_MARGIN;
      if (targetY >= bottomEdge) {
        const diffBottomTopEdge = targetY - bottomEdge;
        smoothedTargetY = bottomEdge + diffBottomTopEdge / BOTTOM_SPRING_CONSTANT;
      }

      $element.style.setProperty("--translate-y", `${smoothedTargetY}px`);
      currentPosition.current = smoothedTargetY;
    },
    [elementRef, isDragging, onDragStart, windowSizeRef],
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

const shouldTriggerClick = (mouseDownTarget: EventTarget | null, mouseUpTarget: EventTarget | null) => {
  if (!(mouseDownTarget instanceof Element) || !(mouseUpTarget instanceof Element)) {
    return false;
  }

  return mouseDownTarget === mouseUpTarget || mouseDownTarget.contains(mouseUpTarget);
};
