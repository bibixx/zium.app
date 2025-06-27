import { Link } from "react-router-dom";
import { ArgumentSnackbarData } from "../../../../components/Snackbar/SnackbarsList.hooks";
import { Button } from "../../../../components/Button/Button";
import { isOpenInNewWindowLinkClick } from "../../../../utils/isOpenInNewWindowLinkClick";
import { PictureConfig } from "../../../../hooks/useFormulaImage/useFormulaImage";

export const getNewEventSnackbarData = (
  title: string,
  latestEventId: string | null,
  pictureConfig: PictureConfig,
  closeSnackbar: () => void,
): ArgumentSnackbarData => {
  const onWatchClick = (e: React.MouseEvent) => {
    if (!isOpenInNewWindowLinkClick(e)) {
      closeSnackbar();
    }
  };

  return {
    title: "Now LIVE",
    content: `Tune in to watch the ${title}`,
    pictureConfig,
    actions: (
      <>
        <Button variant="Secondary" size="Action" fluid onClick={closeSnackbar}>
          Dismiss
        </Button>
        <Button variant="Primary" size="Action" fluid as={Link} onClick={onWatchClick} to={`/race/${latestEventId}`}>
          Watch live
        </Button>
      </>
    ),
    time: Infinity,
  };
};
