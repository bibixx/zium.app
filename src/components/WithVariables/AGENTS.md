# WithVariables

## Usage

Element that writes values to CSS custom properties, the standard way to pass runtime numbers into a CSS module. Use it for values that change on render. For per-frame updates use a ref and `style.setProperty`, so React doesn't re-render.

## Import

```ts
import { WithVariables } from "../WithVariables/WithVariables";
```

## Props

<!-- props: src/components/WithVariables/WithVariables.tsx#WithVariableProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `as` | `React.ElementType \| undefined` | `"div"` | Not typed per element, unlike the [polymorphic family](../../../docs/families/polymorphic.md) |
| `variables` | `Record<string, string \| number \| undefined>` | `{}` | Keys become `--key` unchanged; nullish values are dropped |

Other `div` props pass through.

## Do

- Include units in the value when CSS needs them.
- Add a `stylelint-disable-next-line csstools/value-no-unknown-custom-properties` comment where the SCSS reads a variable defined only at runtime.

## Don't

- Don't use it for values that change every frame. Use `style.setProperty` on a ref.

## Examples

```tsx
// from: src/views/Races/Races.tsx
<WithVariables variables={{ "header-height": `${HEADER_HEIGHT}px` }}>{children}</WithVariables>
```

```tsx
// from: src/views/Races/Sidebar/Sidebar.tsx
<WithVariables className={styles.carrot} variables={{ i: visibleSeasonIndex }} />
```
