import { StreamInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
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
  streamInfo: StreamInfo;
}

export type StreamPickerEntry = DriverStreamPickerEntry | GlobalStreamPickerEntry;
