import { useMemo } from "react";
import styles from "./BackgroundDots.module.scss";
import { WithVariables } from "../../../components/WithVariables/WithVariables";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { calculateBoxShadow } from "./BackgroundDots.utils";

interface BackgroundDotsProps {
  baseGrid: [number, number];
}
export const BackgroundDots = ({ baseGrid }: BackgroundDotsProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize();

  const boxShadows = useMemo(
    () => calculateBoxShadow(windowHeight, windowWidth, baseGrid),
    [baseGrid, windowHeight, windowWidth],
  );

  return (
    <div>
      {boxShadows.map((boxShadow, i) => (
        <WithVariables key={i} className={styles.backgroundDot} variables={{ boxShadow }} />
      ))}
    </div>
  );
};
