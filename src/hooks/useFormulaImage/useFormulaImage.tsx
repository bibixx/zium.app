import { useMemo } from "react";
import { z } from "zod";
import { addQueryParams } from "../../utils/addQueryParams";
import { useDevicePixelRatio } from "../useDevicePixelRatio/useDevicePixelRatio";
import { useImage } from "../useImage/useImage";

function getUrl(url: string, width: number, height: number, devicePixelRatio: number) {
  return addQueryParams(url, {
    w: width * devicePixelRatio,
    h: height * devicePixelRatio,
    q: "HI",
    o: "L",
  });
}

export const PictureId = z
  .string()
  .transform((v) => v.split("/").at(0))
  .brand("PictureId");
export type PictureId = z.infer<typeof PictureId>;

export const PictureUrl = z.string().url().brand("PictureUrl");
export type PictureUrl = z.infer<typeof PictureUrl>;

type PictureVariant = "landscape_hero_web" | "landscape_web" | "portrait_web" | "portrait_hero_web";
export type PictureConfig = {
  id: PictureId | PictureId[];
  variants: PictureVariant[];
};

export const useFormulaImage = (config: PictureConfig | undefined, width: number, height: number) => {
  const devicePixelRatio = useDevicePixelRatio();

  const fullImgSrcList = useMemo(() => {
    if (config?.id == null) {
      return [];
    }

    const urls: string[] = [];
    const ids = Array.isArray(config.id) ? config.id : [config.id];
    for (const id of ids) {
      for (const variant of config.variants) {
        const baseUrl = `https://f1tv.formula1.com/image-resizer/image/${id}/${variant}}`;
        urls.push(getUrl(baseUrl, width, height, devicePixelRatio));
      }
    }

    return urls;
  }, [config, devicePixelRatio, height, width]);

  const src = useImage(fullImgSrcList);

  return src;
};
