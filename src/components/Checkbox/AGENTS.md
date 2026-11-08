# Checkbox

## Usage

Labelled boolean toggle on a visually hidden native input. Today it's only used in the debug panel, so check how it looks before shipping it in product UI.

## Import

```ts
import { Checkbox } from "../Checkbox/Checkbox";
```

## Props

<!-- props: src/components/Checkbox/Checkbox.tsx#CheckboxProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `label` | `string` | | Required visible text |
| `checked` | `boolean` | | Always controlled |
| `onChange` | `(newValue: boolean) => void` | | Receives the new value, not the event |

## Don't

- Don't read `e.target.checked` in `onChange`. The argument is already the boolean.

## Examples

```tsx
// from: src/components/DebugPanel/DebugPanel.tsx
<Checkbox label="Never hide UI" checked={flags.forceUiVisibility} onChange={updateFlag("forceUiVisibility")} />
```
