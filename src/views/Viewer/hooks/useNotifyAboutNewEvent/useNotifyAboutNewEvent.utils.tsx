import { Link } from "react-router-dom";
import { ArgumentSnackbarData } from "../../../../components/Snackbar/SnackbarsProvider";
import { addQueryParams } from "../../../../utils/addQueryParams";
import { Button } from "../../../../components/Button/Button";
import styles from "./useNotifyAboutNewEvent.module.scss";

export const getNewEventSnackbarData = (
  title: string,
  latestEventId: string | null,
  pictureUrl: string,
  closeSnackbar: () => void,
): ArgumentSnackbarData => ({
  title: title,
  content: "New event is live now",
  image: addQueryParams(`https://f1tv.formula1.com/image-resizer/image/${pictureUrl}`, {
    w: 360 * devicePixelRatio,
    h: 180 * devicePixelRatio,
    q: "HI",
    o: "L",
  }),
  actions: (
    <div className={styles.buttonsWrapper}>
      <Button variant="Primary" fluid as={Link} onClick={closeSnackbar} to={`/race/${latestEventId}`}>
        Watch now
      </Button>
      <Button variant="Secondary" fluid onClick={closeSnackbar}>
        Dismiss
      </Button>
    </div>
  ),
  time: 60_000,
});
