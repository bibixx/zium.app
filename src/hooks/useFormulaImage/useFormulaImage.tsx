import { useMemo } from "react";
import { addQueryParams } from "../../utils/addQueryParams";
import { useDevicePixelRatio } from "../useDevicePixelRatio/useDevicePixelRatio";

export const useFormulaImage = (id: string, width: number, height: number) => {
  const devicePixelRatio = useDevicePixelRatio();

  return useMemo(() => {
    const url = id.startsWith("https://") ? id : `https://f1tv.formula1.com/image-resizer/image/${id}`;
    return addQueryParams(url, {
      w: width * devicePixelRatio,
      h: height * devicePixelRatio,
      q: "HI",
      o: "L",
    });
  }, [devicePixelRatio, height, id, width]);
};
