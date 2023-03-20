import classNames from "classnames";
import { ReactNode } from "react";
import { BackgroundDots } from "../../views/Viewer/BackgroundDots/BackgroundDots";
import { useGrid } from "../../views/Viewer/hooks/useGrid";
import { Logo } from "../Logo/Logo";
import styles from "./OnboardingLayout.module.scss";

interface OnboardingLayoutProps {
  children: ReactNode;
  stepsCount: number;
  selectedStepIndex: number;
}
export const OnboardingLayout = ({ children, stepsCount, selectedStepIndex }: OnboardingLayoutProps) => {
  const { baseGrid } = useGrid();

  return (
    <div className={styles.wrapper}>
      <BackgroundDots baseGrid={baseGrid} />
      <div className={styles.backgroundDotsOverlay} />
      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <div className={styles.head}>
            <Logo height={48} color="var(--color-text-accent)" />
            <h1 className={styles.heading}>Formula 1 Multi-View Experience</h1>
          </div>
          {children}
          <Steps count={stepsCount} selectedIndex={selectedStepIndex} />
        </div>
        <div className={styles.disclaimer}>
          F1™ is a registered trademark of Formula One World Championship Limited. This page is not affiliated,
          authorized, endorsed by or in any way officially associated with Formula One World Championship Limited. The
          official F1™ website can be found at{" "}
          <a href="https://www.formula1.com" target="blank" rel="noreferrer">
            https://www.formula1.com
          </a>
          .
        </div>
      </div>
    </div>
  );
};

interface StepsProps {
  count: number;
  selectedIndex: number;
}
export const Steps = ({ count, selectedIndex }: StepsProps) => {
  return (
    <div className={styles.stepsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={classNames(styles.step, { [styles.isSelected]: i === selectedIndex })}></div>
      ))}
    </div>
  );
};
