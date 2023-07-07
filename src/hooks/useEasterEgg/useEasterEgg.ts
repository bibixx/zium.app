import { useCallback, useState } from "react";
import { useHotkeys } from "../useHotkeys/useHotkeys";
import { SHORTCUTS } from "../useHotkeys/useHotkeys.keys";
import smoothOperator from "../../assets/smooth-operator.mp3";
import radioCheck from "../../assets/radio-check.mp3";
import friday from "../../assets/friday.mp3";

const AUDIO_PATHS = [smoothOperator, radioCheck, friday];

export const useEasterEgg = () => {
  const [availableAudioPaths, setAvailableAudioPaths] = useState(AUDIO_PATHS);
  const onEasterEgg = useCallback(() => {
    const i = Math.floor(Math.random() * availableAudioPaths.length);
    const currentAudioFile = availableAudioPaths[i];

    const audio = new Audio(currentAudioFile);
    audio.play();

    if (availableAudioPaths.length > 1) {
      setAvailableAudioPaths(removeElement(availableAudioPaths, i));
    } else {
      setAvailableAudioPaths(AUDIO_PATHS);
    }
  }, [availableAudioPaths]);

  useHotkeys(
    () => ({
      id: "useEasterEgg",
      allowPropagation: true,
      hotkeys: [
        {
          keys: SHORTCUTS.EASTER_EGG,
          action: onEasterEgg,
        },
      ],
    }),
    [onEasterEgg],
  );
};

const removeElement = <T>(array: T[], index: number) => {
  const copy = [...array];
  copy.splice(index, 1);

  return copy;
};
