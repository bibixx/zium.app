# Sheet

## Usage

Full-height panel that slides in from the right, for lists and pickers such as race sessions and the stream picker. It always includes a Close button. For a decision or a short form use [Dialog](../Dialog/AGENTS.md).

## Import

```ts
import { Sheet } from "../Sheet/Sheet";
```

## Props

<!-- props: src/components/Sheet/Sheet.tsx#SheetProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | |
| `isOpen` | `boolean` | | |
| `onClose` | `() => void` | | Backdrop and Close button |
| `onClosed` | `() => void` | | After the exit transition |
| `initialFocus` | `boolean` | `false` | Focuses the first tabbable element |
| `wrapperClassName` | `string` | | Class on the content wrapper |
| `noPadding` | `boolean` | | Removes the default 8px padding |

## Contracts

- [Overlays family](../../../docs/families/overlays.md)

## Do

- Bind `SHORTCUTS.CLOSE` in the consumer.
- Pass `initialFocus` when the first control is a search field.
- Use `noPadding` with `wrapperClassName` for edge-to-edge layouts with their own scrolling.

## Don't

- Don't add your own close button. One is built in.
- Don't render the children from live state alone. Keep a lagged copy until `onClosed`, so content survives the exit animation.

## Examples

```tsx
// from: src/views/Races/Season/Season.tsx
<Sheet onClose={onClose} isOpen={selectedRaceEvent != null} onClosed={resetLaggedState}>
  {laggedSelectedRaceEvent && <div>{laggedSelectedRaceEvent.id}</div>}
</Sheet>
```

```tsx
// from: src/components/StreamPicker/StreamPicker.tsx
<Sheet isOpen={state.isOpen} onClose={onCancel} initialFocus onClosed={onClosed} wrapperClassName={styles.sheet} noPadding>
  {content}
</Sheet>
```

## Known gaps

See the [overlays family](../../../docs/families/overlays.md#known-gaps).
