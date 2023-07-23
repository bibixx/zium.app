import { XCircleIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { Button } from "../Button/Button";
import { BackgroundCards } from "../../views/Viewer/BackgroundCards/BackgroundCards";
import { F1TVTier } from "../../utils/extensionApi";
import styles from "./NoViewerAccess.module.scss";

interface NoViewerAccessProps {
  currentTier: F1TVTier;
}

export const NoViewerAccess = ({ currentTier }: NoViewerAccessProps) => {
  const title = currentTier === "None" ? "No F1 TV subscription" : "Content unavailable with your F1 TV subscription";
  const subtitle =
    currentTier === "None" ? (
      <>
        You must have an active F1 TV Access subscription to access replays or F1 TV Pro subscription to watch live
        sessions and more.{" "}
        <a href="https://www.formula1.com/en/toolbar/content_schedule.html" target="_blank" rel="noopener noreferrer">
          Head over to F1 TV
        </a>{" "}
        to find out more about packages available in your country.
      </>
    ) : (
      <>
        Your current F1 TV subscription does not allow for watching this content. Upgrade your F1 TV subscription or{" "}
        <a href="https://www.formula1.com/en/toolbar/content_schedule.html" target="_blank" rel="noopener noreferrer">
          head over to F1 TV
        </a>{" "}
        to find out more about packages available in your country.
      </>
    );

  return (
    <div className={styles.screenWrapper}>
      <BackgroundCards />
      <div className={styles.wrapper}>
        <DialogContent>
          <div className={styles.contentWrapper}>
            <DialogContentAlert title={title} subtitle={subtitle} icon={XCircleIcon} />
          </div>
          <DialogContentButtonFooter>
            <Button fluid variant="Secondary" as={Link} to="/">
              Go back
            </Button>
            <Button
              fluid
              iconRight={ArrowTopRightOnSquareIcon}
              as="a"
              target="_blank"
              href="https://www.formula1.com/subscribe-to-f1-tv"
            >
              Go to F1 TV
            </Button>
          </DialogContentButtonFooter>
        </DialogContent>
      </div>
    </div>
  );
};
