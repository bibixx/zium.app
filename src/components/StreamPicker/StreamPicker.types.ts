import { GlobalStreamInfo, MainStreamInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { DriverData } from "../../views/Viewer/Viewer.utils";

interface StreamPickerEntryBase {
  id: string;
}

interface DriverStreamPickerEntry extends StreamPickerEntryBase {
  type: "driver";
  driver: DriverData;
}

interface GlobalStreamPickerEntry extends StreamPickerEntryBase {
  type: "global";
  streamInfo: GlobalStreamInfo;
}

interface MainStreamPickerEntry extends StreamPickerEntryBase {
  type: "main";
  streamInfo: MainStreamInfo;
}

export type StreamPickerEntry = DriverStreamPickerEntry | GlobalStreamPickerEntry | MainStreamPickerEntry;
