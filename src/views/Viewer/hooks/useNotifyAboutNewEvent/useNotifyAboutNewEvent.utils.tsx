import { Link } from "react-router-dom";
import { ArgumentSnackbarData } from "../../../../components/Snackbar/SnackbarsList.hooks";
import { Button } from "../../../../components/Button/Button";

export const getNewEventSnackbarData = (
  title: string,
  latestEventId: string | null,
  pictureUrl: string,
  closeSnackbar: () => void,
): ArgumentSnackbarData => ({
  title: "Now LIVE",
  content: `Tune in to watch the ${title}`,
  image: pictureUrl,
  actions: (
    <>
      <Button variant="Secondary" size="Action" fluid onClick={closeSnackbar}>
        Dismiss
      </Button>
      <Button variant="Primary" size="Action" fluid as={Link} onClick={closeSnackbar} to={`/race/${latestEventId}`}>
        Watch live
      </Button>
    </>
  ),
  time: Infinity,
});
