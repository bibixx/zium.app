import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveEvents } from "../../../../hooks/useLiveEvents/useLiveEvents";
import { findEndingLastEvent } from "../../../../utils/findEndingLastEvent";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { Button } from "../../../../components/Button/Button";
import { isRaceGenre } from "../../../../constants/races";
import { fixEmDashes, formatRaceName, toTitleCase } from "../../../../utils/text";
import { useCloseAllSnackbarsOnUnmount } from "../../../../hooks/useCloseAllSnackbarsOnUnmount/useCloseAllSnackbarsOnUnmount";
import { addQueryParams } from "../../../../utils/addQueryParams";
import { useDevicePixelRatio } from "../../../../hooks/useDevicePixelRatio/useDevicePixelRatio";
import styles from "./useNotifyAboutNewEvent.module.scss";

export const useNotifyAboutNewEvent = (currentRaceId: string) => {
  const liveEvents = useLiveEvents(30_000);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const [eventsAlreadyNotifiedAbout, setEventsAlreadyNotifiedAbout] = useState<(string | null)[]>([currentRaceId]);
  const registerSnackbarForUnmount = useCloseAllSnackbarsOnUnmount();
  const devicePixelRatio = useDevicePixelRatio();

  useEffect(() => {
    if (liveEvents.state !== "done") {
      return;
    }

    const latestEvent = findEndingLastEvent(liveEvents.data);

    if (latestEvent == null || eventsAlreadyNotifiedAbout.includes(latestEvent.id)) {
      return;
    }

    setEventsAlreadyNotifiedAbout([...eventsAlreadyNotifiedAbout, latestEvent.id]);
    const isRaceEvent = isRaceGenre(latestEvent.genre);
    const eventDescription = isRaceEvent
      ? formatRaceName(latestEvent.description, false)
      : fixEmDashes(toTitleCase(latestEvent.description));

    const id = openSnackbar({
      title: eventDescription,
      content: "New event is live now",
      image: addQueryParams(`https://f1tv.formula1.com/image-resizer/image/${latestEvent.pictureUrl}`, {
        w: 360 * devicePixelRatio,
        h: 180 * devicePixelRatio,
        q: "HI",
        o: "L",
      }),
      actions: (
        <div className={styles.buttonsWrapper}>
          <Button variant="Primary" fluid as={Link} onClick={() => closeSnackbar(id)} to={`/race/${latestEvent.id}`}>
            Watch now
          </Button>
          <Button variant="Secondary" fluid onClick={() => closeSnackbar(id)}>
            Dismiss
          </Button>
        </div>
      ),
      time: 60_000,
    });
    registerSnackbarForUnmount(id);
  }, [
    closeSnackbar,
    currentRaceId,
    devicePixelRatio,
    eventsAlreadyNotifiedAbout,
    liveEvents,
    openSnackbar,
    registerSnackbarForUnmount,
  ]);
};
