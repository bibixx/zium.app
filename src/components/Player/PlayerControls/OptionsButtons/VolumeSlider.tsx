import { useCallback } from "react";
import { Slider } from "../../../Slider/Slider";

interface VolumeSliderProps {
  volume: number;
  setVolume: (newVolume: number) => void;
  onScrubbingChange?: (isScrubbing: boolean) => void;
}

export const VolumeSlider = ({ volume, setVolume, onScrubbingChange }: VolumeSliderProps) => {
  const onValueChange = useCallback(
    (value: number) => {
      setVolume(Math.round(value));
    },
    [setVolume],
  );

  const renderLabel = useCallback((seekPosition: number) => String(Math.round(seekPosition)), []);

  return (
    <Slider
      value={volume}
      onValueChange={onValueChange}
      onScrubStart={() => onScrubbingChange?.(true)}
      onScrubEnd={() => onScrubbingChange?.(false)}
      accentTrack
      renderLabel={renderLabel}
    />
  );
};
