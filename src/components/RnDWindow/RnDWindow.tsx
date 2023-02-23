import { ReactNode, useRef, useState } from "react";
import cn from "classnames";
import { Rnd } from "react-rnd";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Dimensions } from "../../types/Dimensions";
import { formatPercentToString, roundToNearest, sizePercentToPx, sizePxToPercent } from "./RnDWindow.utils";
import styles from "./RnDWindow.module.css";
import { getStylesWithVariables } from "../WithVariables/WithVariables";

interface RnDWindowProps {
  grid: [number, number] | undefined;
  baseGrid: [number, number];
  children: ReactNode;
  dimensions: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  zIndex: number;
  bringToFront: () => void;
}
export const RnDWindow = ({ dimensions, grid, baseGrid, children, onChange, zIndex, bringToFront }: RnDWindowProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize();
  const [isResizing, setIsResizing] = useState(false);
  const rndRef = useRef<Rnd>(null);

  return (
    <Rnd
      ref={rndRef}
      className={cn(styles.rndWrapper, { [styles.isResizing]: isResizing })}
      style={getStylesWithVariables({ zIndex })}
      size={{
        width: formatPercentToString(dimensions.width),
        height: formatPercentToString(dimensions.height),
      }}
      resizeGrid={grid}
      dragGrid={grid}
      position={{
        x: sizePercentToPx(dimensions.x, windowWidth),
        y: sizePercentToPx(dimensions.y, windowHeight),
      }}
      minHeight={baseGrid[0]}
      minWidth={baseGrid[1]}
      // bounds="window"
      onDragStart={bringToFront}
      onResizeStart={() => {
        bringToFront();
        setIsResizing(true);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setIsResizing(false);
        onChange({
          ...dimensions,
          width: sizePxToPercent(ref.offsetWidth, windowWidth),
          height: sizePxToPercent(ref.offsetHeight, windowHeight),
          x: sizePxToPercent(position.x, windowWidth),
          y: sizePxToPercent(position.y, windowHeight),
        });
      }}
      onDrag={(e, data) => {
        if (grid == null) {
          return;
        }

        const xOnGrid = Math.round(roundToNearest(data.x, grid[0]));
        const isXOnGrid = xOnGrid === Math.round(data.x);

        const yOnGrid = Math.round(roundToNearest(data.y, grid[1]));
        const isYOnGrid = yOnGrid === Math.round(data.y);

        if (isXOnGrid && isYOnGrid) {
          return;
        }

        console.log(xOnGrid, yOnGrid);

        setTimeout(() => {
          rndRef.current?.updatePosition({
            x: xOnGrid,
            y: yOnGrid,
          });
        }, 0);
      }}
      onDragStop={(e, data) => {
        onChange({
          ...dimensions,
          x: sizePxToPercent(data.x, windowWidth),
          y: sizePxToPercent(data.y, windowHeight),
        });
      }}
      resizeHandleClasses={{
        bottom: styles.bottom,
        bottomLeft: styles.bottomLeft,
        bottomRight: styles.bottomRight,
        left: styles.left,
        right: styles.right,
        top: styles.top,
        topLeft: styles.topLeft,
        topRight: styles.topRight,
      }}
    >
      <div className={styles.contents}>{children}</div>
    </Rnd>
  );
};
