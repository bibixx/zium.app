# CustomIcons

## Usage

SVG icons with no Heroicons equivalent: F1 session types, 30-second skips, aspect ratio, captions, time offset, and brand marks. Check Heroicons first (`20/solid` for controls, `24/outline` for larger illustrations), and add here only what's missing.

## Import

```ts
import { DoubleEllipsisIcon, TwitterIcon } from "../CustomIcons/CustomIcons";
```

Each icon takes SVG props and matches `IconComponent` (`src/types/Icon.ts`).

## Do

- Set `width` and `height`, or pass the icon to a component's icon prop.
- Add new SVGs to `src/assets/custom-icons/` and export them from `src/components/CustomIcons/CustomIcons.tsx`.

## Examples

```tsx
// from: src/components/Player/PlayerShell.tsx
<DoubleEllipsisIcon width={20} height={20} />
```

```tsx
// from: src/components/OnboardingLayout/OnboardingLayout.tsx
<TwitterIcon height={20} />
```
