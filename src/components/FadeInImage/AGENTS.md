# FadeInImage

## Usage

`<img>` that fades in once loaded, accepting an undefined `src` while the URL is resolved. Use it for remote images. For F1 images get the URL from `useFormulaImage`.

## Import

```ts
import { FadeInImage } from "../FadeInImage/FadeInImage";
```

## Props

<!-- props: src/components/FadeInImage/FadeInImage.tsx#FormulaImageProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `src` | `string \| undefined` | | |
| `className` | `string` | | |

Other `img` props pass through. `alt` defaults to `""` and `draggable` is off.

## Do

- Set a real `alt` when the image carries information. The default treats it as decorative.

## Examples

```tsx
// from: src/components/HeaderCard/HeaderCard.tsx
<FadeInImage src={src} className={styles.image} alt="" />
```

```tsx
// from: src/components/Snackbar/Snackbar.tsx
<FadeInImage src={imageSrc} className={styles.image} />
```
