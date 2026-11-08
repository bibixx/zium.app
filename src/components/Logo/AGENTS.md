# Logo

## Usage

The ZIUM wordmark as an SVG, sized by at least one dimension and coloured by a token.

## Import

```ts
import { Logo } from "../Logo/Logo";
```

## Props

<!-- props: src/components/Logo/Logo.tsx#LogoProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `color` | `string` | | Pass a token with `var(...)` |
| `height` | `number` | | At least one of `height` and `width` is required |
| `width` | `number` | | |

SVG props pass through.

## Do

- Choose one: `aria-label="ZIUM logo"` when it stands alone, `aria-hidden` when text beside it already names the page.

## Don't

- Don't hardcode a colour. Use `--color-content-strong` or `--color-content-accent`.

## Examples

```tsx
// from: src/views/Races/Header/Header.tsx
<Logo height={32} width={88} color={"var(--color-content-strong)"} aria-label="ZIUM logo" />
```

```tsx
// from: src/views/PrivacyPolicy/PrivacyPolicy.tsx
<Logo className={styles.logo} height={40} aria-hidden />
```

## Known gaps

- [KI-logo-onboarding-unnamed](../../../docs/known-issues.md#ki-logo-onboarding-unnamed-confirmed)
