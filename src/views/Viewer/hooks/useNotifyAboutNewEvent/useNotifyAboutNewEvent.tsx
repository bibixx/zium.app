import { useEffect, useState } from "react";
import { useLiveEvents } from "../../../../hooks/useLiveEvents/useLiveEvents";
import { findEndingLastEvent } from "../../../../utils/findEndingLastEvent";
import { useSnackbars } from "../../../../components/Snackbar/SnackbarsList.hooks";
import { isRaceGenre } from "../../../../constants/races";
import { fixEmDashes, formatRaceName, toTitleCase } from "../../../../utils/text";
import { useCloseAllSnackbarsOnUnmount } from "../../../../hooks/useCloseAllSnackbarsOnUnmount/useCloseAllSnackbarsOnUnmount";
import { useDevicePixelRatio } from "../../../../hooks/useDevicePixelRatio/useDevicePixelRatio";
import { addQueryParams } from "../../../../utils/addQueryParams";
import { useFeatureFlags } from "../../../../hooks/useFeatureFlags/useFeatureFlags";
import { getNewEventSnackbarData } from "./useNotifyAboutNewEvent.utils";

export const useNotifyAboutNewEvent = (currentRaceId: string) => {
  const liveEvents = useLiveEvents(30_000);
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const [eventsAlreadyNotifiedAbout, setEventsAlreadyNotifiedAbout] = useState<(string | null)[]>([currentRaceId]);
  const registerSnackbarForUnmount = useCloseAllSnackbarsOnUnmount();
  const devicePixelRatio = useDevicePixelRatio();
  const disableLiveNotifications = useFeatureFlags((state) => state.flags.disableLiveNotifications);

  useEffect(() => {
    if (liveEvents.state !== "done" || disableLiveNotifications) {
      return;
    }

    const latestEvent = findEndingLastEvent(liveEvents.data, currentRaceId);

    if (latestEvent == null || eventsAlreadyNotifiedAbout.includes(latestEvent.id)) {
      return;
    }

    setEventsAlreadyNotifiedAbout([...eventsAlreadyNotifiedAbout, latestEvent.id]);
    const isRaceEvent = isRaceGenre(latestEvent.genre);
    const eventDescription = isRaceEvent
      ? formatRaceName(latestEvent.description, false)
      : fixEmDashes(toTitleCase(latestEvent.description));

    // TODO: add image
    const url = addQueryParams(`https://f1tv.formula1.com/image-resizer/image/${latestEvent.pictureId}`, {
      w: 360 * devicePixelRatio,
      h: 200 * devicePixelRatio,
      q: "HI",
      o: "L",
    });

    const id = openSnackbar(getNewEventSnackbarData(eventDescription, latestEvent.id, url, () => closeSnackbar(id)));
    registerSnackbarForUnmount(id);
  }, [
    closeSnackbar,
    currentRaceId,
    devicePixelRatio,
    eventsAlreadyNotifiedAbout,
    disableLiveNotifications,
    liveEvents,
    openSnackbar,
    registerSnackbarForUnmount,
  ]);
};
