import { ArrowLeftOnRectangleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Button } from "../../components/Button/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout/OnboardingLayout";
import { Spinner } from "../../components/Spinner/Spinner";
import { requestLogin } from "../../utils/extensionApi";
import styles from "./LogIn.module.scss";

export const LogIn = () => {
  const [isOpening, setIsOpening] = useState(false);

  return (
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
          Login information is stored and used solely on your device. No&nbsp;passwords, personal data, nor payment
          information, is&nbsp;being&nbsp;sent&nbsp;to&nbsp;zium.app&nbsp;servers.
          <br />
          An F1 TV Pro subscription is required to access video streams. zium.app doesn&rsquo;t allow you to watch
          Formula 1 for free.
        </p>
      </div>
    </OnboardingLayout>
  );
};
