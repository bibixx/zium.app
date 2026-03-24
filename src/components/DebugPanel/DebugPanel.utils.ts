import { WindowGridState } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { getDefaultState } from "../../views/Viewer/hooks/useViewerState/useViewerState.defaultState";

export function getLorem(max = Infinity) {
  const fullLorem =
    "Ipsam ea voluptate nostrum cupiditate quo voluptatibus laborum sunt maiores id sequi. Deleniti nobis et natus asperiores doloremque quis aperiam voluptates iusto excepturi eius facere dolorum. Molestiae debitis eaque praesentium quia ex eum exercitationem sequi ut magnam maxime sunt asperiores cumque. Exercitationem ipsam ad quisquam velit itaque et doloribus delectus natus. Alias tempore iusto dolorem facilis ut corporis assumenda repellat itaque sint repellendus. Doloribus est enim et voluptatem cupiditate autem sint voluptatibus.";

  return fullLorem[0] + fullLorem.slice(1, Math.floor(Math.random() * Math.min(fullLorem.length, max)));
}

export const debugStore: WindowGridState = getDefaultState(true);
