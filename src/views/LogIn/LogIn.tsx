import { ArrowLeftOnRectangleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { Dialog } from "../../components/Dialog/Dialog";
import {
  DialogContent,
  DialogContentButtonFooter,
  DialogContentInformation,
} from "../../components/Dialog/DialogContent/DialogContent";
import { OnboardingLayout } from "../../components/OnboardingLayout/OnboardingLayout";
import { Spinner } from "../../components/Spinner/Spinner";
import { useTrackWithTitle } from "../../hooks/useAnalytics/useAnalytics";
import { requestLogin } from "../../utils/extensionApi";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import styles from "./LogIn.module.scss";

export const LogIn = () => {
  useTrackWithTitle("Log in");
  const [isOpening, setIsOpening] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  useHotkeys(
    () => ({
      id: "LogIn",
      allowPropagation: false,
      enabled: isLearnMoreOpen,
      hotkeys: [
        {
          action: () => setIsLearnMoreOpen(false),
          keys: SHORTCUTS.CLOSE,
        },
      ],
    }),
    [isLearnMoreOpen],
  );

  return (
    <>
      <OnboardingLayout stepsCount={2} selectedStepIndex={1}>
        <div>
          <Button
            as={isOpening ? "div" : "button"}
            iconLeft={!isOpening ? ArrowLeftOnRectangleIcon : Spinner}
            variant="Primary"
            fluid
            disabledState={isOpening}
            onClick={() => {
              requestLogin();
              setIsOpening(true);
            }}
          >
            Log in to Formula1.com
          </Button>
          <p className={styles.text}>
            F1 login information is stored solely on your device. F1 TV subscription is required to access video
            streams.{" "}
            <button className={styles.learnMoreButton} onClick={() => setIsLearnMoreOpen(true)}>
              Learn more
            </button>
          </p>
        </div>
      </OnboardingLayout>
      <Dialog isOpen={isLearnMoreOpen} onClose={() => setIsLearnMoreOpen(false)} width={400}>
        <DialogContent>
          <DialogContentInformation
            title="Zium and privacy"
            subtitle={
              <div className={styles.learnMoreContent}>
                <p>
                  Login information is stored and used solely on your device. No passwords, personal data, or payment
                  information is sent to zium.app servers.
                </p>
                <p>
                  You must have an active F1 TV subscription to access video streams. zium.app doesn&rsquo;t allow you
                  to watch Formula 1 for free.
                </p>
                <p>
                  Learn even more from our <Link to="/privacy-policy">Privacy Policy</Link>.
                </p>
              </div>
            }
          />
          <DialogContentButtonFooter>
            <Button fluid variant="Secondary" onClick={() => setIsLearnMoreOpen(false)}>
              Dismiss
            </Button>
          </DialogContentButtonFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
