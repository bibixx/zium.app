# Design system

The mechanics of styling. For intent see [design-language.md](design-language.md). For components see the atom table in the [root AGENTS.md](../AGENTS.md).

## Token pipeline

1. Figma tokens via Tokens Studio: `src/tokens/dark.json`, `src/tokens/light.json`. `src/tokens/_explorations.json` isn't part of the build.
2. `yarn build-tokens` runs `token-transformer`, then Style Dictionary (`tokens.config.cjs`).
3. Output: `src/styles/theme/dark.css` on `:root`, `src/styles/theme/light.css` on `html.light`. Never edit these by hand.
4. `.github/workflows/figma.yml` regenerates and commits the CSS when token files change.

Non-token variables (transitions, z-index, layout) live in `src/styles/variables.css`.

Light overrides semantic colours and elevation only. The app ships dark only: `ThemeLocalStorageClient.get()` in `src/hooks/useTheme/useTheme.tsx` always returns `"dark"`. Light is reachable from the debug panel and isn't restored on reload.

## Colour

Names follow `--color-{core|content|background|border}-…`. Use semantic tokens. `core-*` primitives are for rare exceptions.

| Role | Token | Dark value |
|---|---|---|
| Primary text | `--color-content-strong` | `#ffffff` |
| Body text | `--color-content-default` | white at 76% |
| Secondary text | `--color-content-muted` | white at 49% |
| Accent text | `--color-content-accent` | `#ec110d` |
| Page | `--color-background-surface` | `#000000` |
| Raised, lowest | `--color-background-static-muted` | `#131315` |
| Raised | `--color-background-static-default` | `#1e1e21` |
| Raised, highest | `--color-background-static-strong` | `#36363a` |
| Scrim | `--color-background-overlay` | near black at 64% |
| Hairline | `--color-border-default` | white-ish at 9% |
| Focus and accent border | `--color-border-accent` | `#ec110d` |

Interactive backgrounds come in sets: `--color-background-interactive-{neutral|darken|accent}-{rest|hover|press}`, plus `-disabled` and `-dragger-*`. Use `darken` for controls over video and `accent` for primary actions.

## Typography

Family: General Sans (`src/styles/generalSans.scss`), with a system fallback added by the mixin. Weights are `normal` 500, `medium` 600, `bold` 700, so body text is 500.

Always use the mixin, which sets every font property:

```scss
@include typography(text, 300, regular);
@include typography(heading, 400, default);
@include typography(heading, 300, display);
```

| Style | Sizes | Weights | Notes |
|---|---|---|---|
| `text` | 100 to 400 | `regular`, `strong` | 300 regular is the default body |
| `label` | 300, 400 | none | |
| `heading` | 200 to 900 | `default`, `display` | `display` is uppercase at 100% line height |

Font sizes 100 to 900 are 10, 12, 14, 18, 24, 36, 48, 64, 96px.

## Spacing

No spacing tokens exist. Use raw px on a 4px grid: 4, 8, 12, 16, 24, 32, with 2 for optical fixes and 40, 48, 64 for page layout.

## Radii

`--radii-xsmall` 4, `--radii-small` 8, `--radii-medium` 12, `--radii-large` 16, `--radii-rounded` 999. Pills use `rounded`.

## Elevation

Extend a class from `src/styles/mixins.scss`. Each composes `--elevation-*` layers: ring, highlight, drop shadow.

| Class | Use |
|---|---|
| `.neg-1dp` | Pressed |
| `.pos-1dp` | Resting controls, selected rows |
| `.pos-2dp` | Hover, tooltip |
| `.pos-3dp` | Dialog, dropdown, sheet, snackbar |

```scss
@extend .pos-3dp;
```

## Motion

| Variable | Duration | Use |
|---|---|---|
| `--transition-fast` | 300ms | Hover, colour |
| `--transition-medium` | 400ms | Sheets, list rows |
| `--transition-slow` | 600ms | Dialogs, opacity |

All share `--motion-function`. The usual form is two lines:

```scss
transition: var(--transition-fast);
transition-property: transform, background;
```

Interactive surfaces scale slightly on hover and return to 1 on press.

## Z-index

Global layers are named `--z-index-*` in `src/styles/variables.css`. Use those for anything that stacks across components, and small literals only within a component. Window order comes from JS through `--zIndex`.

## Breakpoint

There is one: a hardcoded `max-width: 800px`, also used in `src/views/NotSupported/NotSupported.tsx`.

## Authoring styles

- CSS Modules with camelCase class names, state as nested `&.isX`.
- `src/styles/mixins.scss` is injected by `vite.config.ts`, so modules don't `@use` it.
- `inner-border($color, $size, $element)` draws a ring on a pseudo-element and sets `overflow: hidden`.
- `feature-flag($flag, $value)` scopes styles to a `data-ff-*` attribute.
- Runtime values reach CSS through [WithVariables](../src/components/WithVariables/AGENTS.md).
- Keyboard-only focus: `[data-whatinput="keyboard"]` draws a 2px accent outline globally. Reuse that selector for custom focus styles.
- Stylelint has one rule, `csstools/value-no-unknown-custom-properties`. A variable set only from JS needs a `stylelint-disable-next-line` comment.

## Icons

Heroicons `20/solid` for controls and `24/outline` for large illustrative icons. Anything missing goes in [CustomIcons](../src/components/CustomIcons/AGENTS.md).

## Exceptions

`src/components/VideoWindow/LiveTimingWindow/LiveTimingWindow.module.scss` uses raw sizes and colours. Don't copy it.
