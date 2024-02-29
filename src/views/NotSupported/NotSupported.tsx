import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { Button } from "../../components/Button/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout/OnboardingLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery/useMediaQuery";
import styles from "./NotSupported.module.scss";

export const NotSupported = () => {
  const isMobile = useMediaQuery("(max-width: 800px)");

  return (
    <OnboardingLayout stepsCount={0} selectedStepIndex={0}>
      {!isMobile && (
        <Button
          iconLeft={ArrowDownTrayIcon}
          variant="Primary"
          fluid
          as="a"
          href="https://www.google.com/intl/en/chrome/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Google Chrome
        </Button>
      )}
      <p className={styles.text}>
        Unfortunately zium.app is currently available only on desktop Chromium-based browsers.{" "}
        {!isMobile && (
          <span>
            For the best experience, please use{" "}
            <a href="https://www.google.com/intl/en/chrome/" rel="noopener noreferrer">
              Google&nbsp;Chrome
            </a>
            ,{" "}
            <a href="https://arc.net/" rel="noopener noreferrer">
              Arc&nbsp;Browser
            </a>{" "}
            or{" "}
            <a href="https://www.microsoft.com/pl-pl/edge" rel="noopener noreferrer">
              Microsoft&nbsp;Edge
            </a>
            .
          </span>
        )}
      </p>
    </OnboardingLayout>
  );
};
