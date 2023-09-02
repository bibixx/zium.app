import { PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Button } from "../../components/Button/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout/OnboardingLayout";
import { Spinner } from "../../components/Spinner/Spinner";
import { useTrackWithTitle } from "../../hooks/useAnalytics/useAnalytics";
import styles from "./NoCompanion.module.scss";

export const NoCompanion = () => {
  useTrackWithTitle("No companion");
  const [isOpening, setIsOpening] = useState(false);

  return (
    <OnboardingLayout stepsCount={2} selectedStepIndex={0}>
      <div>
        <Button
          as="a"
          href="https://chrome.google.com/webstore/detail/ziumapp-helper/bnhjgelnmfeijckmeddnkaicdflimidh"
          target="_blank"
          rel="noreferrer"
          iconLeft={!isOpening ? PuzzlePieceIcon : Spinner}
          variant={isOpening ? "Secondary" : "Primary"}
          fluid
          onClick={() => setIsOpening(true)}
        >
          {!isOpening ? "Install Chrome Extension" : "Refresh the page"}
        </Button>
        <p className={styles.text}>
          The browser extension is required for the app to be able to make requests to formula1.com servers, to retrieve
          race data and access video streams.
        </p>
      </div>
    </OnboardingLayout>
  );
};
