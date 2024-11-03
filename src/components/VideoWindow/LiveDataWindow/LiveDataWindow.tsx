import { Timing } from "../../../views/Timing/Timing";
import { VideoWindowButtonsClose, VideoWindowButtonsTopRightWrapper } from "../VideoWindowButtons/VideoWindowButtons";
import { VideoWindowWrapper } from "../VideoWindowWrapper/VideoWindowWrapper";

interface LiveDataWindowProps {
  onDelete: () => void;
}

export const LiveDataWindow = ({ onDelete }: LiveDataWindowProps) => {
  return (
    <VideoWindowWrapper>
      <Timing />

      <VideoWindowButtonsTopRightWrapper>
        <VideoWindowButtonsClose onClose={onDelete} />
      </VideoWindowButtonsTopRightWrapper>
    </VideoWindowWrapper>
  );
};
