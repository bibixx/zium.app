import cn from "classnames";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MIDDLE_DOT, NON_BREAKING_HYPHEN } from "../../utils/text";
import { CookieBanner } from "../CookieBanner/CookieBanner";
import { Logo } from "../Logo/Logo";
import { FigmaIcon, GitHubIcon, TwitterIcon } from "../CustomIcons/CustomIcons";
import styles from "./OnboardingLayout.module.scss";

interface OnboardingLayoutProps {
  children: ReactNode;
  stepsCount: number;
  selectedStepIndex: number;
}
export const OnboardingLayout = ({ children, stepsCount, selectedStepIndex }: OnboardingLayoutProps) => {
  return (
    <div className={styles.fullHeightWrapper}>
      <div className={styles.wrapper}>
        <div className={styles.contentWrapper}>
          <div className={styles.mobileDivider}></div>
          <div className={styles.content}>
            <div className={styles.head}>
              <Logo height={40} color="var(--color-content-accent)" />
              <h1 className={styles.heading}>Formula 1 Multi{NON_BREAKING_HYPHEN}View Experience</h1>
            </div>
            {children}
            <Steps count={stepsCount} selectedIndex={selectedStepIndex} />
          </div>
          <div className={styles.mobileDivider}></div>
          <div className={styles.disclaimer}>
            This website is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE,
            FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One
            Licensing B.V.
          </div>
        </div>
      </div>
      <CookieBanner position="bottom" mode="sticky" />
      <footer className={styles.footer}>
        <div className={styles.footerTextSection}>
          <Link to="/privacy-policy" className={styles.footerLink}>
            Privacy policy
          </Link>
          <span>{MIDDLE_DOT}</span>
          <a href="mailto:zium@zium.app" className={styles.footerLink}>
            Contact us
          </a>
          <span className={styles.potentiallyLonelyMiddleDot}>{MIDDLE_DOT}</span>
        </div>
        <div className={styles.footerButtonsWrapper}>
          <a
            href="https://twitter.com/ziumapp"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <TwitterIcon height={20} />
          </a>
          <a
            href="https://github.com/bibixx/zium.app"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <GitHubIcon height={20} />
          </a>
          <a
            href="https://www.figma.com/community/file/1250905585551204036"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FigmaIcon height={20} />
          </a>
        </div>
      </footer>
    </div>
  );
};

interface StepsProps {
  count: number;
  selectedIndex: number;
}
export const Steps = ({ count, selectedIndex }: StepsProps) => {
  if (count === 0) {
    return null;
  }

  return (
    <div className={styles.stepsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(styles.step, { [styles.isSelected]: i === selectedIndex })}></div>
      ))}
    </div>
  );
};
