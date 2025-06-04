import { useMemo } from "react";
import { addQueryParams } from "../../utils/addQueryParams";
import { useDevicePixelRatio } from "../useDevicePixelRatio/useDevicePixelRatio";

function getUrl(id: string, width: number, height: number, devicePixelRatio: number) {
  const url = id.startsWith("https://") ? id : `https://f1tv.formula1.com/image-resizer/image/${id}`;

  return addQueryParams(url, {
    w: width * devicePixelRatio,
    h: height * devicePixelRatio,
    q: "HI",
    o: "L",
  });
}

export const useFormulaImage = (id: string, width: number, height: number) => {
  const devicePixelRatio = useDevicePixelRatio();

  return useMemo(() => getUrl(id, width, height, devicePixelRatio), [devicePixelRatio, height, id, width]);
};

export const useFormulaImages = (ids: string[], width: number, height: number) => {
  const devicePixelRatio = useDevicePixelRatio();

  return useMemo(() => {
    return ids.map((id) => getUrl(id, width, height, devicePixelRatio));
  }, [devicePixelRatio, height, ids, width]);
};
