import { XCircleIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { Button } from "../Button/Button";
import { BackgroundCards } from "../../views/Viewer/BackgroundCards/BackgroundCards";
import styles from "./NoViewerAccess.module.scss";

export const NoViewerAccess = () => {
  return (
    <div className={styles.screenWrapper}>
      <BackgroundCards />
      <div className={styles.wrapper}>
        <DialogContent>
          <DialogContentAlert
            title="No F1 TV subscription"
            subtitle="You must have an active F1 TV Access subscription to access replays or F1 TV Pro subscription to watch live sessions and more."
            icon={XCircleIcon}
          />
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
