# Tooltip

## Usage

Short text hint on hover or focus, built on Radix. Use it to explain a `disabledState` control or give extra detail on a value. For anything interactive use [Dropdown](../Dropdown/AGENTS.md) or [Dialog](../Dialog/AGENTS.md).

## Import

```ts
import { Tooltip } from "../Tooltip/Tooltip";
```

## Props

<!-- props: src/components/Tooltip/Tooltip.tsx#TooltipProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `content` | `ReactNode \| null \| false` | | `null` or `false` renders the child alone |
| `children` | `ReactNode` | | Single element that accepts a ref |
| `delayDuration` | `number` | Radix default | Milliseconds |
| `skipDelayDuration` | `number` | Radix default | Each tooltip has its own Provider, so this doesn't carry across tooltips |
| `disableHoverableContent` | `boolean` | `true` | |

Radix content props such as `side` pass through. `sideOffset` and `collisionPadding` default to 4.

## Do

- Use a conditional `content` to turn the tooltip off, instead of branching in JSX.
- Wrap a plain element such as `span` when the trigger is text.

## Don't

- Don't wrap a `disabled` button, which gets no pointer or focus events. Use `disabledState` on [Button](../Button/AGENTS.md).
- Don't use a child that can't take a ref, because the trigger renders `asChild`. Wrap it in a `span`.
- Don't put links or buttons inside. Use [Dropdown](../Dropdown/AGENTS.md).

## Examples

See [Button](../Button/AGENTS.md) for a tooltip explaining `disabledState`.

```tsx
// from: src/views/Races/RaceDetails/RaceDetails.tsx
<Tooltip
  content={isFuture(raceDetails.startDate) ? formatDateDayLongMonthYearTime(raceDetails.startDate) : null}
  delayDuration={0}
  disableHoverableContent
>
  <span>{formatDateRelative(raceDetails.startDate)}</span>
</Tooltip>
```
