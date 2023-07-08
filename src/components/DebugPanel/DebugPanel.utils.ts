import { output } from "zod";
import { getInitialOffsets } from "../../hooks/useUserOffests/useUserOffests.utils";
import { WindowGridState } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { ziumOffsetsValidator } from "../../views/Viewer/hooks/useZiumOffsets/useZiumOffsets.validator";
import { getDefaultState } from "../../views/Viewer/hooks/useViewerState/useViewerState.defaultState";

export function getLorem(max = Infinity) {
  const fullLorem =
    "Ipsam ea voluptate nostrum cupiditate quo voluptatibus laborum sunt maiores id sequi. Deleniti nobis et natus asperiores doloremque quis aperiam voluptates iusto excepturi eius facere dolorum. Molestiae debitis eaque praesentium quia ex eum exercitationem sequi ut magnam maxime sunt asperiores cumque. Exercitationem ipsam ad quisquam velit itaque et doloribus delectus natus. Alias tempore iusto dolorem facilis ut corporis assumenda repellat itaque sint repellendus. Doloribus est enim et voluptatem cupiditate autem sint voluptatibus.";

  return fullLorem[0] + fullLorem.slice(1, Math.floor(Math.random() * Math.min(fullLorem.length, max)));
}

export const debugStore: WindowGridState = getDefaultState(true);

function downloadFile(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

type ZiumOffsetsResponse = output<typeof ziumOffsetsValidator>;
export const downloadOffsetsForCurrentRace = (raceId: string, showErrorSnackbar: () => void) => {
  const offsets = getInitialOffsets(raceId);
  if (offsets == null) {
    showErrorSnackbar();
    return;
  }

  const data: ZiumOffsetsResponse = {
    additionalStreams: offsets.additionalStreams,
    timestamp: Date.now(),
  };

  const output = JSON.stringify(data);

  downloadFile(`${raceId}.json`, output);
};
