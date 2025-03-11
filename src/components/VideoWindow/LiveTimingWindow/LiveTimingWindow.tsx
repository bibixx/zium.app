import { ChosenValueType } from "../../../hooks/useStreamPicker/useStreamPicker";
import { LiveTimingGridWindow } from "../../../types/GridWindow";
import { assertNever } from "../../../utils/assertNever";
import {
  VideoWindowButtonsClose,
  VideoWindowButtonsOffset,
  VideoWindowButtonsTopLeftWrapper,
  VideoWindowButtonsTopRightWrapper,
} from "../VideoWindowButtons/VideoWindowButtons";
import { LeaderBoard } from "../../liveTiming/LeaderBoard";
import { Map } from "../../liveTiming/map/Map";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";
import { useSettingsStore } from "../../../hooks/liveTiming/useStores/useSettingsStore";

interface LiveTimingWindowProps {
  gridWindow: LiveTimingGridWindow;
  onDelete: () => void;
  onSourceChange: (data: ChosenValueType) => void;
}

export const LiveTimingWindow = (props: LiveTimingWindowProps) => {
  const { gridWindow } = props;
  if (gridWindow.dataType === "leaderboard") {
    return <LeaderBoardWindow onDelete={props.onDelete} />;
  }

  if (gridWindow.dataType === "map") {
    return <MapWindow onDelete={props.onDelete} />;
  }

  return assertNever(gridWindow.dataType);
};

interface LeaderBoardWindowProps {
  onDelete: () => void;
}
const LeaderBoardWindow = ({ onDelete }: LeaderBoardWindowProps) => {
  const delay = useSettingsStore((s) => s.delay);
  const setDelay = useSettingsStore((s) => s.setDelay);

  return (
    <VideoWindowWrapper>
      <LeaderBoard />

      <VideoWindowButtonsTopLeftWrapper>
        <VideoWindowButtonsOffset onOffsetChange={setDelay} currentOffset={delay} usesZiumOffsets={false} />
      </VideoWindowButtonsTopLeftWrapper>
      <VideoWindowButtonsTopRightWrapper>
        <VideoWindowButtonsClose onClose={onDelete} />
      </VideoWindowButtonsTopRightWrapper>
    </VideoWindowWrapper>
  );
};

interface MapWindowProps {
  onDelete: () => void;
}
const MapWindow = ({ onDelete }: MapWindowProps) => {
  const delay = useSettingsStore((s) => s.delay);
  const setDelay = useSettingsStore((s) => s.setDelay);

  return (
    <VideoWindowWrapper>
      <Map />

      <VideoWindowButtonsTopLeftWrapper>
        <VideoWindowButtonsOffset onOffsetChange={setDelay} currentOffset={delay} usesZiumOffsets={false} />
      </VideoWindowButtonsTopLeftWrapper>
      <VideoWindowButtonsTopRightWrapper>
        <VideoWindowButtonsClose onClose={onDelete} />
      </VideoWindowButtonsTopRightWrapper>
    </VideoWindowWrapper>
  );
};
