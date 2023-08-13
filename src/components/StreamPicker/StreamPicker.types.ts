import { DataStreamInfo, MainStreamInfo } from "../../hooks/useVideoRaceDetails/useVideoRaceDetails.types";
import { DriverData } from "../../views/Viewer/Viewer.utils";

interface StreamPickerEntryBase {
  id: string;
}

interface DriverStreamPickerEntry extends StreamPickerEntryBase {
  type: "driver";
  driver: DriverData;
}

interface DataStreamPickerEntry extends StreamPickerEntryBase {
  type: "data";
  streamInfo: DataStreamInfo;
}

interface MainStreamPickerEntry extends StreamPickerEntryBase {
  type: "main";
  streamInfo: MainStreamInfo;
}

export type StreamPickerEntry = DriverStreamPickerEntry | DataStreamPickerEntry | MainStreamPickerEntry;
