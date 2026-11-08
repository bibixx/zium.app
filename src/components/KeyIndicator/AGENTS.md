# KeyIndicator

## Usage

Single keyboard key rendered as `<kbd>`, turning names such as `ArrowUp` or `Digit1` into symbols. For a full shortcut use `HumanReadableShortcuts`, which adds platform-aware modifiers.

## Import

```ts
import { KeyIndicator } from "../KeyIndicator/KeyIndicator";
```

## Props

<!-- props: src/components/KeyIndicator/KeyIndicator.tsx#KeyIndicatorProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `shortcut` | `string` | | Key name or literal text |

## Don't

- Don't build `SHORTCUTS` combinations by hand. Use `HumanReadableShortcuts`, which handles Cmd versus Ctrl.

## Examples

```tsx
// from: src/components/Input/Input.tsx
<KeyIndicator shortcut={shortcut} />
```

```tsx
// from: src/components/HumanReadableShortcuts/HumanReadableShortcuts.tsx
<KeyIndicator key="shift" shortcut={"Shift"} />
```
