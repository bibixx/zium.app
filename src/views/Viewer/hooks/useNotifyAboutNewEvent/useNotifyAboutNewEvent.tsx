import { useEffect, useState } from "react";
import { useLiveEvents } from "../../../../hooks/useLiveEvents/useLiveEvents";
import { findEndingLastEvent } from "../../../../utils/findEndingLastEvent";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsProvider";
import { isRaceGenre } from "../../../../constants/races";
import { fixEmDashes, formatRaceName, toTitleCase } from "../../../../utils/text";
import { useCloseAllSnackbarsOnUnmount } from "../../../../hooks/useCloseAllSnackbarsOnUnmount/useCloseAllSnackbarsOnUnmount";
import { useDevicePixelRatio } from "../../../../hooks/useDevicePixelRatio/useDevicePixelRatio";
import { getNewEventSnackbarData } from "./useNotifyAboutNewEvent.utils";

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

    const id = openSnackbar(
      getNewEventSnackbarData(eventDescription, latestEvent.id, latestEvent.pictureUrl, () => closeSnackbar(id)),
    );
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
